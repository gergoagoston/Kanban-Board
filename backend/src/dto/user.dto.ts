import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Expose, plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class UserOutDto {
  @Expose()
  _id!: ObjectId;

  @Expose()
  username?: string;

  constructor(partial: Partial<UserOutDto>) {
    Object.assign(this, partial);
  }
}

export class UserInDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/[a-zA-Z0-9- ]+/)
  username?: string;

  @IsString()
  @MinLength(6)
  password?: string;
}
