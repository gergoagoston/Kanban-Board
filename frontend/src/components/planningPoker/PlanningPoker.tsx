import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext/useAuth';
import { getBoardsTasksWithVoting } from '../../api/board.api';
import PokerTask from './PokerTask';
import { Container, Stack } from 'react-bootstrap';
import Navbarom from '../Navbarom';
import UserList from './UserList';
import { UserInDto } from '../../dto/user.dto';
import { getBoardUsers } from '../../api/user.api';
import useTaskSocket from '../../hooks/useTaskSocket';
import AddTask from '../board/AddTask';
import { TaskInDto } from '../../dto/task.dto';
import useVoteSocket from '../../hooks/useVoteSocket';

function PlanningPoker() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskInDto[]>([]);
  const [users, setUsers] = useState<UserInDto[]>([]);
  const [showOwnerActions, setShowOwnerActions] = useState<boolean>(false);
  const { boardId } = useParams<{ boardId: string }>();
  const guaranteedBoardId = boardId!;

  const { sendBoardWatch } = useTaskSocket(boardId, tasks, setTasks);
  const { voteTask, sendPokerWatch } = useVoteSocket();

  useEffect(() => {
    const fetchData = async () => {
      if (!boardId) return;
      if (user) {
        console.log('fetching tasks with voting');
        const fetchedTasks = await getBoardsTasksWithVoting(boardId, user._id, false);

        setTasks(fetchedTasks);
      }

      const fetchedUsers = await getBoardUsers(boardId);

      if (user && user._id == fetchedUsers.owner._id) {
        setShowOwnerActions(true);
      }

      setUsers(fetchedUsers.users);
    };

    fetchData();

    if (boardId && user) {
      sendBoardWatch(boardId);
      sendPokerWatch(boardId, user._id!);
    }
  }, [boardId, user, sendPokerWatch, sendBoardWatch]);

  return (
    <div>
      <Navbarom></Navbarom>

      <Container fluid>
        <Stack direction="horizontal" gap={3} className="height1">
          <h2> Planning Poker</h2>
          <div className="p-2 ms-auto">
            <AddTask boardId={guaranteedBoardId}></AddTask>
          </div>
        </Stack>

        <Stack direction="horizontal" className="height2">
          <Stack direction="horizontal" className="height2" style={{ flex: 8 }}>
            <Stack className="column-box-container">
              <h2>Yet to vote</h2>
              {boardId && (
                <PokerTask
                  showOwnerActions={showOwnerActions}
                  tasks={tasks.filter((task) => task.status === 0)}
                  users={users}
                  boardId={boardId}
                  voteTask={voteTask}
                  status={0}
                ></PokerTask>
              )}
            </Stack>
            <Stack className="column-box-container">
              <h2>Voted tasks</h2>
              {boardId && (
                <PokerTask
                  showOwnerActions={showOwnerActions}
                  tasks={tasks.filter((task) => task.status === 1)}
                  users={users}
                  boardId={boardId}
                  voteTask={voteTask}
                  status={1}
                />
              )}
            </Stack>
          </Stack>

          <Stack className="column-box-container-without-bar" style={{ flex: 2 }}>
            <h2>Users</h2>
            {boardId && <UserList {...{ showOwnerActions, users, setUsers, boardId }} />}
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}

export default PlanningPoker;
