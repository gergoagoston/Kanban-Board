import { createContext } from 'react';
import { Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './EventTypes';

export const SocketContext = createContext<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
