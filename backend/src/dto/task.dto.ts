import { Expose, plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId, MaxLength } from 'class-validator';
import { ObjectId } from 'mongodb';
import { UserOutDto } from './user.dto';

export class TaskOutDto {
  @Expose()
  _id!: ObjectId;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose()
  date!: Date;

  @Expose()
  status!: number;

  @Expose()
  priority!: number;

  @Expose()
  assignedUser?: UserOutDto;

  @Expose()
  boardId!: ObjectId;

  @Expose()
  hasEstimation!: boolean;

  @Expose()
  estimation!: number;

  constructor(partial: Partial<TaskOutDto>) {
    Object.assign(this, partial);
  }
}

export class TaskInDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsOptional()
  status?: number; // Defaults to 0 (to-do)

  @IsNumber()
  @IsOptional()
  priority?: number; // Defaults to 0 (low)

  @IsMongoId()
  @IsOptional()
  assignedId?: ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  boardId!: ObjectId;

  @IsNumber()
  @IsOptional()
  estimation?: number;
}
