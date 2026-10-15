import Task from '../../model/task.model';
import { ObjectId } from 'mongodb';
import morgan from 'morgan';
import express, { Router } from 'express';
import cors from 'cors';
import { bodyValidator, mongoIdValidator } from '../../middleware/validation';
import { TaskInDto } from '../../dto/task.dto';
import TaskMapper from '../../mapper/task.mapper';
import * as amqp from 'amqplib';
import redisClient from '../../connection/redisClient';

const exchange = 'amqp.topic.board';

// RabbitMQ connection and channel (initialize once and reuse)
let channel: amqp.Channel;
(async () => {
  const connection = await amqp.connect({});
  channel = await connection.createChannel();
})();

export default function getTaskApiRoutes() {
  const router = Router();
  router.use(morgan('tiny'));
  router.use(cors());
  router.use(express.json());

  // GET /api/tasks
  // Fetch all tasks, optionally filtered by the presence of an estimation
  router.get('/', async (req, res) => {
    try {
      const { hasEstimation } = req.query; // Get the query parameter
      let tasks;

      if (hasEstimation !== undefined) {
        if (hasEstimation !== 'true' && hasEstimation !== 'false') {
          tasks = await Task.find({});
        } else {
          const estimation = hasEstimation === 'true';
          tasks = await Task.find().where('hasEstimation').equals(estimation).exec();
        }
      } else {
        tasks = await Task.find({});
      }

      const taskOutDtos = await TaskMapper.modelsToDtos(tasks);

      res.send(taskOutDtos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/tasks/:id
  // Fetch a specific task by its ID
  router.get(
    '/:id',
    mongoIdValidator(),
    /*authorizeUserTask(),*/ async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const current_task = await Task.findById(id);
        if (!current_task) {
          res.sendStatus(404).json({ error: 'Requested task not found' });
          return;
        }

        const taskOutDto = await TaskMapper.modelToDto(current_task.toObject());

        res.send(taskOutDto);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  // POST /api/tasks
  // Create a new task
  router.post(
    '/',
    bodyValidator(TaskInDto),
    /*authorizeUserTaskInsertion(),*/ async (req, res) => {
      try {
        const { title, content, status, priority, assignedId, boardId, estimation } = req.body;
        if (!title) {
          res.status(400).send('Title and priority is required!');
          return;
        }

        const date = new Date();
        const new_task = new Task({
          title,
          content,
          date,
          status,
          priority,
          boardId,
          estimation,
        });
        await new_task.save();

        const taskOutDto = await TaskMapper.modelToDto(new_task);

        //# Publishing the change to Rabbit
        const message = JSON.stringify({
          type: 'insert',
          task: taskOutDto,
        });
        channel.publish(exchange, boardId, Buffer.from(message));

        res.send(taskOutDto);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  // PATCH /api/tasks/:id
  // Update an existing task by its ID
  router.patch('/:id', mongoIdValidator(), bodyValidator(TaskInDto), async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);

      const existing_task = await Task.findById(id);
      if (!existing_task) {
        res.sendStatus(404).json({ error: 'Requested task not found' });
        return;
      }

      const date = new Date();
      const body_data = req.body;
      const updateData = { ...body_data, date };

      if ('estimation' in updateData) {
        updateData.hasEstimation = updateData.estimation !== null;
      }

      const updated_task = await Task.findByIdAndUpdate(id, updateData, { new: true });

      const taskOutDto = await TaskMapper.modelToDto(updated_task);

      //# Publishing the change to Rabbit
      const message = JSON.stringify({
        type: 'update',
        task: taskOutDto,
      });
      channel.publish(exchange, updateData.boardId, Buffer.from(message));

      if (existing_task.status !== 0 && updateData.status === 0) {
        console.log(`Deleting votes from Redis for task ${id} due to status change to 0`);
        await redisClient.del(`votes:${id}`);
      } 

      res.send(taskOutDto);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/tasks/:id
  // Delete a specific task by its ID
  router.delete(
    '/:id',
    mongoIdValidator(),
    /*authorizeUserTask(),*/ async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        let current_task = await Task.findById(id);
        if (!current_task) {
          res.sendStatus(404).json({ error: 'Requested task not found' });
          return;
        }
        await Task.findByIdAndDelete(id);

        //# Publishing the change to Rabbit
        const message = JSON.stringify({
          type: 'delete',
          task: current_task,
        });

        if (current_task.status === 0 || current_task.status === 1) {
          const taskId = current_task.id.toString();
          console.log(`Deleting votes from Redis for task ${taskId}`);
          await redisClient.del(`votes:${taskId}`);
        }

        // send the change with RabbitMQ
        channel.publish(exchange, current_task.boardId.toString(), Buffer.from(message));
        res.sendStatus(204);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  return router;
}
