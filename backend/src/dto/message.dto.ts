import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';


export class MessageOutDto {
  @Expose()
  _id!:ObjectId

  @Expose()
  senderId!: ObjectId;

  @Expose()
  receiverId!: ObjectId;

  @Expose()
  content!: string;

  @Expose()
  timestamp?: Date;

  constructor(partial: Partial<MessageOutDto>) {
    Object.assign(this, partial);
  }
}

export class MessageInDto {
  @IsMongoId()
  senderId!: ObjectId;

  @IsMongoId()
  receiverId!: ObjectId;

  @IsString()
  content!: string;

  @IsOptional()
  timestamp?: Date;
}