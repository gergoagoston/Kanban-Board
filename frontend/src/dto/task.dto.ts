import { UserInDto } from "./user.dto";

export class TaskInDto {
    _id!:string;
    title!:string;
    content?:string;
    date!:string
    status?:number
    priority?:number
    assignedUser?:UserInDto
    boardId!:string
    estimation?:number
    canVote:boolean = true
}

export class TaskOutDto {
    _id!:string;
    title!:string;
    content?:string;
    date!:string
    status?:number
    priority?:number
    assignedId?:string
    boardId!:string
    estimation?:number
    canVote:boolean = true
}

export class TaskCreateDto {
  title!: string;
  content?: string;
  status?: number;
  priority?: number;
  assignedId?: string;
  boardId!: string;
}
