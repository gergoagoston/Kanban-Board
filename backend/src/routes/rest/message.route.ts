import { Router } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import express from 'express';
import Message from '../../model/message.model';
import { bodyValidator, mongoIdValidator } from '../../middleware/validation';
import MessageMapper from '../../mapper/message.mapper';
import { MessageInDto } from '../../dto/message.dto';
import { ObjectId } from 'mongodb';

export default function getMessageApiRoutes() {
  const router = Router();
  router.use(morgan('tiny'));
  router.use(cors());
  router.use(express.json());

  router.get('/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(MessageMapper.modelsToDtos(messages));
  });

  router.post('', bodyValidator(MessageInDto), async (req, res) => {
    const message = req.body;

    try {
      const messageDto = MessageMapper.modelToDto(message);
      const new_message = new Message(messageDto);
      await new_message.save();
      res.status(201).json(messageDto);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save messages' });
    }
  });

  router.delete('/:id', mongoIdValidator(), async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      await Message.findByIdAndDelete(id);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
