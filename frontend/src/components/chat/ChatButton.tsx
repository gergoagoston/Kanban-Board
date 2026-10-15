import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import chatIcon from '../../assets/chatIcon.png';

export default function ChatButton() {
  return (
      <Link to="/chat" className="board-link">
        <Button className="custom-button">
          <img src={chatIcon} alt="Chat" className="kep2" />
        </Button>
      </Link>
  );
}
