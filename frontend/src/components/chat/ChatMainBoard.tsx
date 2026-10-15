import { Container, Stack } from 'react-bootstrap';
import Navbarom from '../Navbarom';
import UserList from './UserList';
import ChatUI from './ChatUI';
import '../../style/Chat.css';
import { useState } from 'react';

export default function ChatMainBoard() {
  const [activeUserId, setActiveUserId] = useState<string>("");

  return (
    <Container fluid className="d-flex flex-column m-0 p-0 main-container">
      <Navbarom />
      <Stack direction="horizontal" gap={3} className="flex-grow-1  pb-3">
        <Container className="w-25 p-0 m-3 background-chat-columns border-box">
          <UserList activeUserId={activeUserId} setActiveUserId={setActiveUserId} />
        </Container>
        <Container className="w-75 background-chat-columns border-box">
          <ChatUI activeUserId={activeUserId} />
        </Container>
      </Stack>
    </Container>
  );
}
