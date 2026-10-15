import { TaskInDto } from '../../dto/task.dto';
import { UserInDto } from '../../dto/user.dto';
import { VoteDto } from '../../dto/vote.dto';
import '../../style/Task.css';
import NotVotedTaskDetails from './NotVotedTaskDetails';
import VotedTaskDetails from './VotedTaskDetails';

interface TaskProps {
  showOwnerActions: boolean;
  tasks: TaskInDto[];
  boardId: string;
  users: UserInDto[];
  voteTask: (vote: VoteDto) => void;
  status: number;
}

function PokerTask({ showOwnerActions, tasks, users, boardId, voteTask, status }: TaskProps) {
  return (
    <div className="column-box">
      {tasks.map(
        (task) =>
          (status === 0 && (
            <NotVotedTaskDetails
              showOwnerActions={showOwnerActions}
              task={task}
              boardId={boardId}
              key={task._id}
              voteTask={voteTask}
            />
          )) ||
          (status === 1 && (
            <VotedTaskDetails showOwnerActions={showOwnerActions} task={task} users={users} key={task._id} />
          )),
      )}
    </div>
  );
}

export default PokerTask;
