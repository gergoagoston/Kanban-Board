import { TaskOutDto } from '../../dto/task.dto';
import { ObjectId } from 'mongodb';
import { VoteInDto } from '../../dto/vote.dto';

export interface ServerToClientEvents {
  inserted_task_notification: (task: TaskOutDto) => void;
  updated_task_notification: (task: TaskOutDto) => void;
  removed_task_notification: (id: ObjectId) => void;
  voted_task_notification: (id: ObjectId) => void;
  voted_users: (users: VotedUsersForTask) => void;
  new_peer: (peerId: string) => void;
}

export interface ClientToServerEvents {
  board_watch: (boardId: string) => void;
  poker_watch: (boardId: string, userId: string) => void;
  connect_peer: (userId: ObjectId, peerId:string) => void;
  get_peer: (userId: ObjectId) => void;
  vote_task_notification: (vote: VoteInDto) => void;
  get_voted_users: (taskId: string) => void;
  get_voted_users_with_estimation: (taskId: string) => void;
}

export type TaskChange = {
  type: string;
  task: TaskOutDto;
};

export type VotedUsersForTask = {
  taskId: string;
  userNames: string[];
  estimations?: number[];
};
