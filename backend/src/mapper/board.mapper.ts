import { BoardOutDto, BoardOutDtoWithUserList, DetailedBoardOutDto, ReducedBoardOutDto } from '../dto/board.dto';
import { plainToInstance } from 'class-transformer';
import { UserOutDto } from '../dto/user.dto';
import { TaskOutDto } from '../dto/task.dto';

export class BoardMapper {
  static modelToDto(board: any): BoardOutDto {
    return plainToInstance(BoardOutDto, {
      _id: board._id,
      name: board.name,
      owner: board.owner,
      users: board.users,
    });
  }

  static modelToDtoWithOwner(board: any, owner: UserOutDto): ReducedBoardOutDto {
    return plainToInstance(ReducedBoardOutDto, {
      _id: board._id,
      name: board.name,
      owner: owner,
      users: board.users,
    });
  }

  static detailedModelToDto(board: any, tasks: TaskOutDto[], owner: UserOutDto): DetailedBoardOutDto {
    return plainToInstance(DetailedBoardOutDto, {
      _id: board._id,
      name: board.name,
      owner: owner,
      users: board.users,
      tasks: tasks,
    });
  }

  static detailedUserListModelToDto(board: any, owner: any, users: UserOutDto[]): BoardOutDtoWithUserList {
    return plainToInstance(BoardOutDtoWithUserList, {
      _id: board._id,
      name: board.name,
      owner: owner,
      users: users,
    });
  }

  static modelsToDtos(boards: any[]): BoardOutDto[] {
    return boards.map((board) => BoardMapper.modelToDto(board));
  }
}

export default BoardMapper;
