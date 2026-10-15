import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, RequestHandler, Response } from 'express';

import { NotFoundError, UnauthorizedError } from './errorhandling';
import Task from '../model/task.model';
import Board from '../model/board.model';
import { ObjectId } from 'mongodb';

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY environment variable is required');
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

interface IBoard {
  _id: ObjectId;
  name: string;
  owner: ObjectId;
  users: ObjectId[];
}

function getUserFromToken(req: Request): ObjectId {
  const token = req.header('Authorization');

  if (!token) {
    throw new UnauthorizedError('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

    if (!decoded) {
      throw new UnauthorizedError('Invalid token: User ID not found.');
    }

    return decoded.userid;
  } catch (error) {
    throw new UnauthorizedError('Invalid token.');
  }
}

export const verifyTokenMatchesReqId = (paramKey = 'id'): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserFromToken(req);
      const paramId = req.params[paramKey];

      if (paramId !== userId.toString()) {
        return next(new UnauthorizedError('Access denied: Token user mismatch.'));
      }

      next();
    } catch (error) {
      next(new UnauthorizedError(`Invalid token!`));
    }
  };
};

export const authorizeUserTask = (paramKey = 'id'): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserFromToken(req);
      const taskId = req.params[paramKey];

      // Find the task and populate the board
      const task = await Task.findById(taskId).populate('boardId');
      if (!task) {
        return next(new NotFoundError("The task doesn't exist."));
      }

      const board = task.boardId as unknown as IBoard; // Explicit type assertion
      if (!board) {
        return next(new NotFoundError("The board for this task doesn't exist."));
      }

      if (board.owner !== userId && !board.users.includes(userId)) {
        return next(new UnauthorizedError('You are not authorized to access this task.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeUserTaskInsertion = (): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserFromToken(req);
      const boardId = req.body.boardId;

      const board = (await Board.findById(boardId)) as unknown as IBoard;
      if (!board) {
        return next(new NotFoundError("The board doesn't exist."));
      }

      if (board.owner !== userId && !board.users.includes(userId)) {
        return next(new UnauthorizedError('You are not authorized to access this board.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeUserBoard = (paramKey = 'id'): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserFromToken(req);
      const boardId = req.params[paramKey];

      // Find the task and populate the board
      const board = (await Board.findById(boardId)) as unknown as IBoard;
      if (!board) {
        return next(new NotFoundError("The board doesn't exist."));
      }

      if (board.owner !== userId && !board.users.includes(userId)) {
        return next(new UnauthorizedError('You are not authorized to access this board.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
