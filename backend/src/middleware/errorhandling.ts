import { NextFunction, Request, Response } from 'express';

export class BadRequestError extends Error {
  static statusCode = 400;

  messages: string | string[];

  constructor(messages: string | string[]) {
    super();
    this.messages = messages || 'Bad request';
  }
}

export class NotFoundError extends Error {
  static statusCode = 404;
}

export class UnauthorizedError extends Error {
  static statusCode = 401;

  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class InternalServerError extends Error {
  static statusCode = 500;

  constructor() {
    super('Internal Server Error');
  }
}

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  err = err || new NotFoundError();

  // különböző hibatípusokból származó válasz
  if (err instanceof NotFoundError) {
    res.sendStatus(NotFoundError.statusCode);
  } else if (err instanceof BadRequestError) {
    res.status(BadRequestError.statusCode).send({ messages: err.messages });
  } else if (err instanceof UnauthorizedError) {
    res.status(UnauthorizedError.statusCode).send({ message: err.message });
  } else {
    res.status(500).send({ message: err.message });
  }
};
