import User from '../../model/user.model';
import board from '../../model/board.model';
import { ObjectId } from 'mongodb';
import morgan from 'morgan';
import express, { Router } from 'express';
import cors from 'cors';
import { UserInDto } from '../../dto/user.dto';
import { bodyValidator, mongoIdValidator } from '../../middleware/validation';
import BoardMapper from '../../mapper/board.mapper';
import UserMapper from '../../mapper/user.mapper';

export default function getUserApiRoutes() {
  const router = Router();
  router.use(morgan('tiny'));
  router.use(cors());
  router.use(express.json());

  // Get all boards for a specific user by user ID
  router.get('/:id/boards', mongoIdValidator() /*, verifyToken()*/, async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      const get_user = await User.findById(id);
      if (!get_user) {
        res.sendStatus(404);
        return;
      }

      const boards = await board
        .find({
          users: id,
        })
        .select('id name owner')
        .populate('owner', '_id username');

      const boardDtos = boards.map((board) => {
        const ownerDto = UserMapper.modelToDto(board.owner);
        return BoardMapper.modelToDtoWithOwner(board, ownerDto);
      });

      res.status(200).json(boardDtos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get all users
  router.get('', async (req, res) => {
    try {
      const users = await User.find();

      const userDtos = UserMapper.modelsToDtos(users);

      res.send(userDtos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get a specific user by user ID
  router.get('/:id', mongoIdValidator() /*, verifyToken()*/, async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      const get_user = await User.findById(id);
      if (!get_user) {
        res.sendStatus(404);
        return;
      }

      const userDto = UserMapper.modelToDto(get_user);

      res.send(userDto);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create a new user
  router.post('', bodyValidator(UserInDto), async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;

      if (!username || !password) {
        res.status(400).send('Username or Password field is empty!');
        return;
      }
      const new_user = new User({ username, password });
      await new_user.save();

      const userDto = UserMapper.modelToDto(new_user);

      res.status(201).send(userDto);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update an existing user by user ID
  router.patch('/:id', mongoIdValidator(), bodyValidator(UserInDto), async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      let new_user = await User.findById(id);
      if (!new_user) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }

      new_user = await User.findByIdAndUpdate(id, req.body, { new: true });

      const userDto = UserMapper.modelToDto(new_user);

      res.send(userDto);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete a user by user ID
  router.delete('/:id', mongoIdValidator(), async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      await User.findByIdAndDelete(id);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
