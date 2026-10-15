import { useEffect, useContext, useCallback } from 'react';
import { SocketContext } from '../contexts/socketContext/SocketContext';
import { TaskInDto } from '../dto/task.dto';

export default function useTaskSocket(
  boardId: string | undefined,
  tasks: TaskInDto[],
  setTasks: React.Dispatch<React.SetStateAction<TaskInDto[]>>,
) {
  const socket = useContext(SocketContext);

  const sendBoardWatch = useCallback(
    (boardId: string) => {
      socket?.emit('board_watch', boardId);
    },
    [socket],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('inserted_task_notification', (task: TaskInDto) => {
      console.log('🚀 ~ socket.on ~ inserted_task_notification:', task);
      task.canVote = true;
      setTasks((prevTasks) => [...prevTasks, task]);
    });

    socket.on('updated_task_notification', (task: TaskInDto) => {
      console.log('🚀 ~ socket.on ~ updated_task_notification:', task);

      const existingTask = tasks.find((t) => t._id === task._id);

      if (existingTask && task.status === 2 && existingTask.status === 1) {
        task.canVote = true;
        setTasks((prevTasks) => [...prevTasks, task]);
      } else {
        setTasks((prevTasks) => prevTasks.map((t) => (t._id === task._id ? task : t)));
      }
    });

    socket.on('removed_task_notification', (_id: string) => {
      console.log('🚀 ~ socket.on ~ removed_task_notification:');
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== _id));
    });

    return () => {
      socket.off('inserted_task_notification');
      socket.off('updated_task_notification');
      socket.off('removed_task_notification');
    };
  }, [socket, boardId, setTasks]);

  return { sendBoardWatch };
}
