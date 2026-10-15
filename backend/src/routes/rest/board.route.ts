import board from '../../model/board.model';
import task from '../../model/task.model';
import { Types, Schema } from 'mongoose';
import morgan from 'morgan';
import express, { Router } from 'express';
import cors from 'cors';
import { bodyValidator, mongoIdValidator } from '../../middleware/validation';
import BoardMapper from '../../mapper/board.mapper';
import TaskMapper from '../../mapper/task.mapper';
import UserMapper from '../../mapper/user.mapper';
import { BoardInDto } from '../../dto/board.dto';
import VoteMapper from '../../mapper/vote.mapper';
import redisClient from '../../connection/redisClient';
import User from '../../model/user.model';

export default function getBoardApiRoutes() {
  const router = Router();
  router.use(morgan('tiny'));
  router.use(cors());
  router.use(express.json());

  // Get all boards 
router.get('/', async (req, res) => {
	try {
		const boards = await board.find().select('id name owner users').populate('owner', '_id username');

		const boardDtos = boards.map((board) => {
			const ownerDto = UserMapper.modelToDto(board.owner);
			return BoardMapper.modelToDtoWithOwner(board, ownerDto);
		});
		res.send(boardDtos);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get a specific board by id, populated with tasks and filtered by estimation status
router.get('/:id', mongoIdValidator() /*, authorizeUserBoard(), verifyToken()*/, async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);
		const { hasEstimation } = req.query;
		const new_board = await board.findById(id).populate('owner', '_id username');

		if (!new_board) {
			res.sendStatus(404).json({ error: 'Requested board not found' });
			return;
		}
		let tasks;

		if (hasEstimation == undefined) {
			res.status(400).json({
				error: 'hasEstimation query parameter missing(true/false).',
			});
			return;
		}

		if (hasEstimation !== 'true' && hasEstimation !== 'false') {
			res.status(400).json({
				error: 'hasEstimation query parameter should be boolean.',
			});
			return;
		}

		const estimation = hasEstimation === 'true';
		tasks = await task.find({ boardId: id }).where('hasEstimation').equals(estimation).exec();

		const owner = UserMapper.modelToDto(new_board.owner);

		const taskdtos = await TaskMapper.modelsToDtos(tasks);
		const boardDto = BoardMapper.detailedModelToDto(new_board, taskdtos, owner);

		res.send(boardDto);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get tasks for a specific user in a board with the canVote field for every task, filtered by estimation status
router.get('/:id/users/:userId', mongoIdValidator(), async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);
		const userId = new Types.ObjectId(req.params.userId) as unknown as Schema.Types.ObjectId;
		const { hasEstimation } = req.query;

		let currentBoard = await board.findById(id);
		if (!currentBoard) {
			res.sendStatus(404).json({ error: "Requested board not found" });
			return;
		}

		if (!currentBoard.users.includes(userId)) {
			res.sendStatus(404).json({ error: "User not found in the board" });
			return;
		}

		if (hasEstimation == undefined) {
			res.status(400).json({
				error: 'hasEstimation query parameter missing(true/false).',
			});
			return;
		}

		if (hasEstimation !== 'true' && hasEstimation !== 'false') {
			res.status(400).json({
				error: 'hasEstimation query parameter should be boolean.',
			});
			return;
		}

		const estimation = hasEstimation === 'true';
		const tasks = await task.find({ boardId: id }).where('hasEstimation').equals(estimation).exec();

		const users = await User.find({ _id: { $in: tasks.map((task) => task.assignedId) } });
		const userDtos = users.map((user) => UserMapper.modelToDto(user));
		const taskVoteDtos = VoteMapper.modelsToVoteDtos(tasks, userDtos);

		// Check if the user has already voted for each task and set the canVote property accordingly
		for (const task of taskVoteDtos) {
			const vote = await redisClient.hGet(`votes:${task._id}`, userId.toString());

			if (vote) {
				task.canVote = false;
			}
		}

		res.send(taskVoteDtos);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get all users of a specific board
router.get('/:id/users', mongoIdValidator() /*, authorizeUserBoard(), verifyToken()*/, async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);

		const new_board = await board.findById(id).populate('users', '_id username').populate('owner', '_id username');
		// console.log(new_board);

		if (!new_board) {
			res.sendStatus(404).json({ error: "Requested board not found" });
			return;
		}

		const users = new_board.users;
		const owner = UserMapper.modelToDto(new_board.owner);

		const userDtos = users.map((user) => UserMapper.modelToDto(user));
		const boardDto = BoardMapper.detailedUserListModelToDto(new_board, owner, userDtos);
		res.send(boardDto);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Create a new board
router.post('/', bodyValidator(BoardInDto), async (req, res) => {
	try {
		const { name, owner, users = [] } = req.body;

		if (!name || !owner) {
			res.status(400).send('Name and Owner is required!');
			return;
		}

		const existingBoard = await board.findOne({ name }).exec();
		if (existingBoard) {
			res.status(400).json({ error: 'Board name already exists!' });
			return;
		}

		if (!users.includes(owner)) {
			users.push(owner);
		}

		const new_board = new board({ name, owner, users });
		await new_board.save();

		const boardDto = BoardMapper.modelToDto(new_board);

		res.send(boardDto);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Update a specific board by id
router.patch('/:id', mongoIdValidator(), bodyValidator(BoardInDto), async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);
		const { name, owner, users } = req.body;

		let new_board = await board.findById(id);
		if (!new_board) {
			res.sendStatus(404).json({ error: "Requested board not found" });
			return;
		}

		new_board = new board({ name, owner, users });

		new_board = await board.findByIdAndUpdate(id, req.body, { new: true });
		const boardDto = BoardMapper.modelToDto(new_board);

		res.send(boardDto);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Add a user to a specific board
router.patch('/:id/users/:userId', mongoIdValidator(), async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);
		const userId = new Types.ObjectId(req.params.userId) as unknown as Schema.Types.ObjectId;

		let new_board = await board.findById(id);
		if (!new_board) {
			res.sendStatus(404).json({ error: "Requested board not found" });
			return;
		}

		if (!new_board.users.includes(userId)) {
			new_board.users.push(userId);
			await new_board.save();
		}

		const boardDto = BoardMapper.modelToDto(new_board);
		res.send(boardDto);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Delete a specific board by id
router.delete('/:id', mongoIdValidator(), async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);
		let new_board = await board.findById(id);
		if (!new_board) {
			res.sendStatus(404).json({ error: "Requested board not found" });
			return;
		}
		await board.findByIdAndDelete(id);
		res.sendStatus(204);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Remove a user from a specific board
router.delete('/:id/users/:userId', mongoIdValidator(), async (req, res) => {
	try {
		const id = new Types.ObjectId(req.params.id);
		const userId = new Types.ObjectId(req.params.userId);
		let new_board = await board.findById(id);
		if (!new_board) {
			res.sendStatus(404).json({ error: "Requested board not found" });
			return;
		}
		new_board.users = new_board.users.filter((user) => {
			return !(user as unknown as Types.ObjectId).equals(userId);
		});
		new_board.save();
		res.sendStatus(204);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

  return router;
}
