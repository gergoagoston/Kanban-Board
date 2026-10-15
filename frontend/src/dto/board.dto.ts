import { TaskInDto } from "./task.dto";
import { UserInDto } from "./user.dto";

export class BoardInDto {
  _id!: string;
  name!: string;
  owner!: UserInDto;
}

export class BoardOutDto {
  name!: string;
  owner!: string;
}

export class BoardDetailedDto extends BoardInDto {
    users!:UserInDto[];
    tasks!:TaskInDto[];
  }

export class BoardInDtoWithUserList extends BoardInDto {
  users!: UserInDto[];
}
