import { useEffect, useState } from 'react';
import { Container, Button, Stack } from 'react-bootstrap';
import Navbarom from '../Navbarom';
import { getUsersBoards } from '../../api/board.api';
import { BoardInDto } from '../../dto/board.dto';
import { useAuth } from '../../contexts/authContext/useAuth';
import CreateBoardModal from './CreateBoardModal';
import JoinBoardModal from './JoinBoardModal';
import Board from '../board/Board';
import ChatButton from '../chat/ChatButton';

const Dashboard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<BoardInDto[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getUsersBoards(user._id);
        setBoards(data);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div>
      <Navbarom></Navbarom>
      <div className="dashboard">
        <Stack direction="horizontal" gap={3} className="height1">
          <h1 className='m-2'>Hello {user?.username}! These are your boards:</h1>
          <div className="ms-auto m-2">
            <ChatButton />
          </div>
        </Stack>
        <Stack direction="horizontal" gap={2}>
          <Button variant="success" className="action-button m-2" onClick={() => setShowCreateModal(true)}>
            Create Board
          </Button>
          <Button variant="success" className="action-button2" onClick={() => setShowJoinModal(true)}>
            Join Board
          </Button>
        </Stack>
        <div>
          <div className="board-container">
            {boards.map((item) => (
              <Board key={item._id} {...item} />
            ))}
          </div>
        </div>
      </div>

      {user && (
        <Container>
          <CreateBoardModal
            show={showCreateModal}
            handleClose={() => setShowCreateModal(false)}
            setBoards={setBoards}
          />
          <JoinBoardModal show={showJoinModal} handleClose={() => setShowJoinModal(false)} setBoards={setBoards} />
        </Container>
      )}
    </div>
  );
};

export default Dashboard;
