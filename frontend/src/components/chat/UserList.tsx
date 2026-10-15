import { useEffect, useState } from 'react';
import { getAllUsers } from '../../api/user.api';
import { UserInDto } from '../../dto/user.dto';
import usePeerSocket from '../../hooks/usePeerSocekt';
import { useAuth } from '../../contexts/authContext/useAuth';
import { usePeer } from '../../contexts/peerContext/usePeer';
import { FileDto } from '../../dto/message.dto';

interface UserListProps {
  activeUserId: string;
  setActiveUserId: (userId: string) => void;
}

export default function UserList(props: UserListProps) {
  const [users, setUsers] = useState<UserInDto[]>([]);
  const { activeUserId, setActiveUserId } = props;
  const { getPeer } = usePeerSocket();
  const { setLatestFile } = usePeer();
  const { user } = useAuth();

  const handleClick = (userId: string) => {
    setActiveUserId(userId);
    getPeer(userId);
    setLatestFile({} as FileDto)
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchData();
  }, [setActiveUserId]);

  return (
    <>
      <div className="border-bottom border-secondary border-1"></div>
      <h1 className="m-2 p-2">Users</h1>
      {users
        .filter((u) => u._id !== user?._id)
        .map((user) => (
          <div
            key={user._id}
            className={`m-0 p-3 border-bottom border-secondary border-2 ${user._id === activeUserId ? 'selected' : 'hover'}`}
            onClick={() => handleClick(user._id)}
          >
            <strong>{user.username}</strong>
          </div>
        ))}
    </>
  );
}
