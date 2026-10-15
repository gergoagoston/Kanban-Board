import { useContext, useEffect, useState, useCallback } from 'react';
import { SocketContext } from '../contexts/socketContext/SocketContext';
import { VotedUsersForTask } from '../types/ServerToClient';
import { VoteDto } from '../dto/vote.dto';

export default function useVoteSocket() {
  const socket = useContext(SocketContext);
  const [taskId, setTaskId] = useState<string>('');
  const [votedUsers, setVotedUsers] = useState<VotedUsersForTask>({ taskId: '', userNames: [] });

  const getVotedUsers = (taskId: string) => {
    setTaskId(taskId); // Update the current task ID
    socket?.emit('get_voted_users', taskId);
  };

  const getVotedUsersWithEstimation = (taskId: string) => {
    setTaskId(taskId); // Update the current task ID
    socket?.emit('get_voted_users_with_estimation', taskId);
  };
  
  const voteTask = (vote: VoteDto) => {
    console.log('🚀 ~ voteTask ~ vote:', vote);
    socket?.emit('vote_task_notification', vote);
  };

  const sendPokerWatch = useCallback(
    (boardId: string, userId: string) => {
      socket?.emit('poker_watch', boardId, userId);
    },
    [socket],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('voted_users', (message: VotedUsersForTask) => {
      // Dynamically check if the message is relevant
      if (message.taskId === taskId) {
        console.log('🚀 Received voted_users for task:', message);
        setVotedUsers(message);
      }
    });

    return () => {
      socket.off('voted_users');
    };
  }, [socket, taskId]); // Keep the listener active for the selected task ID

  return {
    voteTask,
    getVotedUsers,
    votedUsers,
    sendPokerWatch,
    getVotedUsersWithEstimation,
  };
}
