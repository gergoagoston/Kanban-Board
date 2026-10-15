import { UserInDto } from '../../dto/user.dto';
import { Link } from 'react-router-dom';
import '../../style/Board.css';

interface Props {
  name: string;
  _id: string;
  owner: UserInDto;
}

function Board({ name, _id, owner }: Props) {
  return (
    <Link to={`/dashboard/${_id}`} className="board-link">
      <div className="custom-board">
        <h4>{name}</h4>
        <h5 className="owner">Owner: {owner.username}</h5>
      </div>
    </Link>
  );
}

export default Board;
