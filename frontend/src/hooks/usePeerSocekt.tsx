import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../contexts/socketContext/SocketContext';

export default function usePeerSocket() {
  const socket = useContext(SocketContext);
  const [peerId, setPeerId] = useState('');

  const getPeer = (userId: string) => {
    console.log(`🚀 ~ getPeerId for user: ${userId}`);
    socket?.emit('get_peer', userId);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('new_peer', (peerId: string) => {
      console.log('🚀 ~ socket.on ~ new_peer:', peerId);
      setPeerId(peerId)
    });

    return () => {
      socket.off('new_peer');
    };
  }, [socket]);

  return { getPeer, peerId };
}
