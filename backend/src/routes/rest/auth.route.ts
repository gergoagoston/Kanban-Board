import morgan from 'morgan';
import express, { Router } from 'express';
import cors from 'cors';
import User from '../../model/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default function getAuthApiRoutes() {
  const router = Router();

  router.use(morgan('tiny'));
  router.use(cors());
  router.use(express.json());

  const SECRET_KEY = process.env.SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is required');
  }

  router.post('/register', async (req, res) => {
    const username = req.body.username;
    try {
      const userAlreadyExists = await User.find({ username }).exec();
      if (userAlreadyExists.length > 0) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }
      let password = await bcrypt.hash(req.body.password, 10);
      const user = new User({ username, password });
      await user.save();
      res.status(201).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await User.find({ username }).exec();
      if (result.length === 0) {
        res.status(404).json({ error: 'User not found!' });
        return;
      }

      const user = result[0];

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      const _id = user.id;

      const token = jwt.sign({ username, userid: _id }, SECRET_KEY, {
        expiresIn: '1h',
      });

      res.status(200).json({ _id, username, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
