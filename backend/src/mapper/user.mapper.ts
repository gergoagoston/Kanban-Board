import { UserOutDto } from '../dto/user.dto';
import { plainToInstance } from 'class-transformer';

export class UserMapper {
  static modelToDto(user: any): UserOutDto {
    return plainToInstance(UserOutDto, {
      _id: user._id,
      username: user.username,
    });
  }

  static modelsToDtos(users: any[]): UserOutDto[] {
    return users.map((user) => UserMapper.modelToDto(user));
  }
}

export default UserMapper;
