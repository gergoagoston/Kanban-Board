import { TaskInDto } from '../../dto/task.dto';
import { VoteDto } from '../../dto/vote.dto';
import { VotedUsersForTask } from '../../types/ServerToClient';

export interface ServerToClientEvents {
  removed_task_notification: (_id: string) => void;
  inserted_task_notification: (task: TaskInDto) => void;
  voted_task_notification: (vote: VoteDto) => void;
  updated_task_notification: (task: TaskInDto) => void;
  voted_users: (users: VotedUsersForTask) => void;
  new_peer:(peerId:string) => void;
}

export interface ClientToServerEvents {
  board_watch: (boardId: string) => void;
  vote_task_notification: (vote: VoteDto) => void;
  get_voted_users: (taskId: string) => void;
  get_voted_users_with_estimation: (taskId: string) => void;
  poker_watch: (boardId: string, userId: string) => void;
  connect_peer: (userId: string, peerId: string) => void;
  get_peer: (userId: string) => void;
}
