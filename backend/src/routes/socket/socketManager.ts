import { Server } from 'socket.io';
import http from 'http';
import { ServerToClientEvents, ClientToServerEvents } from './types';
import { handleVoteSocket } from './voteSocket';
import { handleBoardSocket } from './boardSocket';
import { handlePeerSocket } from './peerSocket';

// Socket.IO server instance
let io: Server<ClientToServerEvents, ServerToClientEvents>;

// Initialize the Socket.IO server
export const initSocket = async (server: http.Server) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' },
    path: "/ws",
  });

  io.on('connection', (socket) => {
    handleBoardSocket(socket, io); // Zsolt
    handleVoteSocket(socket, io); // Gergo
    handlePeerSocket(socket, io); // Kozos
  });

  // await handleDatabaseChanges(); // MongoDb Change Events

  return io;
};
