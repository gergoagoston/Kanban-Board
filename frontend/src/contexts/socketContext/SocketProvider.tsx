import React, { useMemo, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { ClientToServerEvents, ServerToClientEvents } from './EventTypes';
import { usePeer } from '../peerContext/usePeer';
import { useAuth } from '../authContext/useAuth';

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
  const {peerId} = usePeer()
  const {user} = useAuth()
  const socket = useMemo<Socket<ServerToClientEvents, ClientToServerEvents>>(
    () => io(BASE_URL, { path: "/ws", transports: ["websocket"] }),
    []
  );

  useEffect(() => {
    if (user?._id && peerId) {
      console.log('Connecting peer with ID:', peerId, 'and user ID:', user._id);
      socket.emit('connect_peer', user._id,peerId);
    }
  }, [peerId, socket, user?. _id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
