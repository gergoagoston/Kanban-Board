import { TaskInDto } from '../../dto/task.dto';
import '../../style/BoardDetails.css';

import '../../style/Task.css';

import TaskDetails from './TaskDetails';

interface TaskProps {
  status: number;
  tasks: TaskInDto[];
}

function Task({ status, tasks }: TaskProps) {
  return (
    <div className="column-box">
      {tasks
        .filter((task) => task.status === status)
        .map((item) => (
          <TaskDetails task={item} key={item._id}></TaskDetails>
        ))}
    </div>
  );
}

export default Task;
