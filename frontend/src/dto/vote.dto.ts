export class VoteDto {
  userId!: string;
  taskId!: string;
  boardId!: string;
  vote!: number;
}

export class VoteInDto {
  taskId!: string;
  boardId!: string;
  user!: UserVoteDto[];
}

export class UserVoteDto {
  userId!: string;
  vote!: number;
}
