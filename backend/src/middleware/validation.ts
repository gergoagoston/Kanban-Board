import { ValidationError, validate } from 'class-validator';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';

import { BadRequestError } from './errorhandling';

export const mongoIdValidator = (paramKey = 'id'): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const objectIdStr = req.params[paramKey];
    if (!ObjectId.isValid(objectIdStr)) {
      next(new BadRequestError(`${objectIdStr} is not a valid ObjectId`));
      return;
    }
    next();
  };
};

export const bodyValidator = (dtoClass: any): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorsMessages = errors.map((error: ValidationError) => Object.values(error.constraints ?? {})).flat();
      return next(new BadRequestError(errorsMessages));
    }
    next();
  };
};
