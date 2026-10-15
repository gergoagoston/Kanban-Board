import '../../style/PlanningPoker.css';
import { UserInDto } from '../../dto/user.dto';
import { Button, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/authContext/useAuth';
import { removeUserFromBoard } from '../../api/user.api';
import { toast } from 'react-toastify';

interface UserListProps {
  showOwnerActions: boolean;
  users: UserInDto[];
  setUsers: React.Dispatch<React.SetStateAction<UserInDto[]>>;
  boardId: string;
}

const handleRemoveUser = async (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  boardId: string,
  setUsers: React.Dispatch<React.SetStateAction<UserInDto[]>>,
) => {
  const userId = e.currentTarget.id;
  try {
    await removeUserFromBoard(boardId, userId);
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    toast.success('User removed successfully');
  } catch {
    toast.error('Failed to remove user');
  }
};

function UserList({ showOwnerActions, users, setUsers, boardId }: UserListProps) {
  const { user } = useAuth();

  return (
    <div className="column-box">
      {users.map((_user) => (
        <Card
          key={_user._id}
          id={_user._id}
          className={` custom-task> ${user?._id !== _user._id && `bg-transparent`} ${user?._id == _user._id && `bg-secondary`}`}
        >
          <Card.Body>
            <div className="custom-container">
              <div className="custom-text">{_user.username}</div>
              {showOwnerActions && user?._id !== _user._id && (
                <Button
                  id={_user._id}
                  variant="danger"
                  onClick={(e) => handleRemoveUser(e, boardId, setUsers)}
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default UserList;
