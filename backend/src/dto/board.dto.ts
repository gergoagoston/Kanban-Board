import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsMongoId, IsArray } from 'class-validator';
import { ObjectId } from 'mongodb';
import { UserOutDto } from './user.dto';
import { TaskOutDto } from './task.dto';

export class BoardOutDto {
  @Expose()
  _id!: ObjectId;

  @Expose()
  name!: string;

  @Expose()
  owner!: UserOutDto;

  @Expose()
  users?: ObjectId[];

  constructor(partial: Partial<BoardOutDto>) {
    Object.assign(this, partial);
  }
}

export class DetailedBoardOutDto {
  @Expose()
  _id!: ObjectId;

  @Expose()
  name!: string;

  @Expose()
  owner!: UserOutDto;

  @Expose()
  users?: ObjectId[];

  @Expose()
  tasks!: TaskOutDto[];

  constructor(partial: Partial<BoardOutDto>) {
    Object.assign(this, partial);
  }
}

export class ReducedBoardOutDto {
  @Expose()
  _id!: ObjectId;

  @Expose()
  name!: string;

  @Expose()
  owner!: UserOutDto;

  constructor(partial: Partial<BoardOutDto>) {
    Object.assign(this, partial);
  }
}

export class BoardOutDtoWithUserList {
  @Expose()
  _id!: ObjectId;

  @Expose()
  name!: string;

  @Expose()
  owner!: UserOutDto;

  @Expose()
  users!: UserOutDto[];

  constructor(partial: Partial<BoardOutDto>) {
    Object.assign(this, partial);
  }
}

export class BoardInDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsMongoId()
  @IsNotEmpty()
  owner!: ObjectId;

  users?: ObjectId[]; // Array of user IDs
}
