import { Expose, plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { TaskOutDto } from './task.dto';

export class VoteInDto {
  @Expose()
  userId!: ObjectId;

  @Expose()
  taskId!: ObjectId;

  @Expose()
  boardId!: ObjectId;

  @Expose()
  vote!: number;

  constructor(partial: Partial<VoteInDto>) {
    Object.assign(this, partial);
  }
}

export class VoteOutDto {
  taskId!: ObjectId;
  boardId!: ObjectId;
  user!: UserVoteDto[];
}

export class TaskVoteOutDto extends TaskOutDto {
  canVote!: boolean;
}

export class UserVoteDto {
  userId!: string;
  vote!: number;
}
