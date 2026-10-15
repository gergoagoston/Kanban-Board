import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBoardsTasks } from '../../api/board.api';
import { TaskInDto } from '../../dto/task.dto';
import Navbarom from '../Navbarom';
import { Container, Stack, Button } from 'react-bootstrap';
import { STATUS_LABELS, TASK_STATUSES } from '../../constants/TaskContants';
import Task from './Task';
import planningPoker from '../../assets/planningPoker.png';
import '../../style/BoardDetails.css';
// import useTaskSocket from '../../hooks/useTaskSocket';
import AddTask from './AddTask';
import ChatButton from '../chat/ChatButton';
import useTaskSocket from '../../hooks/useTaskSocket';

function BoardDetails() {
  const { boardId } = useParams<{ boardId: string }>();
  const guaranteedBoardId = boardId!;
  const [tasks, setTasks] = useState<TaskInDto[]>([]);
  const [boardName, setBoardName] = useState('');
  const location = useLocation();

  const { sendBoardWatch } = useTaskSocket(boardId, tasks, setTasks);

  useEffect(() => {
    const fetchData = async () => {
      if (!boardId) return;
      const data = await getBoardsTasks(boardId, true);
      setTasks(data.tasks);
      setBoardName(data.name);
    };
    fetchData();
    if (boardId) {
      sendBoardWatch(boardId);
    }
  }, [boardId, sendBoardWatch]);

  return (
    <div>
      <Navbarom></Navbarom>
      <Container fluid>
        <Stack direction="horizontal" gap={3} className="height1">
          <h2>{boardName}</h2>

          
          <AddTask boardId={guaranteedBoardId}></AddTask>
          <ChatButton></ChatButton>  

          <Link to={location.pathname + `/planningPoker`} className="board-link">
            <Button variant='secondary' className="custom-button">
              <img alt="Planning Poker" src={planningPoker} className="kep2"></img>
            </Button>
          </Link>
        </Stack>

        <Stack direction="horizontal" className="height2">
          <Stack className="column-box-container">
            <h2>{STATUS_LABELS[2]}</h2>
            <Task status={TASK_STATUSES.TODO} tasks={tasks}></Task>
          </Stack>
          <Stack className="column-box-container">
            <h2>{STATUS_LABELS[3]}</h2>
            <Task status={TASK_STATUSES.IN_PROGRESS} tasks={tasks}></Task>
          </Stack>
          <Stack className="column-box-container-without-bar">
            <h2>{STATUS_LABELS[4]}</h2>
            <Task status={TASK_STATUSES.DONE} tasks={tasks}></Task>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}

export default BoardDetails;
