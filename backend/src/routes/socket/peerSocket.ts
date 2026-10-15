import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from './types';
import redisClient from '../../connection/redisClient';
import { ObjectId } from 'mongodb';


/**
 * Handles peer socket events for connecting and retrieving peers.
 *
 * @param socket - The socket instance for the connected client.
 * @param io - The Socket.IO server instance.
 *
 * @event connect_peer - Stores the peer ID for a given user ID in Redis.
 * @param userId - The ObjectId of the user.
 * @param peerId - The peer ID to be stored.
 *
 * @event get_peer - Retrieves the peer ID for a given user ID from Redis.
 * @param userId - The ObjectId of the user.
 *
 * @emits new_peer - Emits the retrieved peer ID to the client.
 *
 * @throws Will log an error if storing or retrieving the peer ID fails.
 */
export const handlePeerSocket = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
  socket.on('connect_peer', async (userId: ObjectId, peerId: string) => {
    try {
      await redisClient.hSet(`p2p_users`, userId.toString(), peerId);
      console.log(`Stored peer: ${peerId} for user: ${userId}`);
    } catch (error) {
      console.error(`Error storing peer: ${peerId} for user: ${userId}`, error);
    }
  });

  socket.on('get_peer', async (userId: ObjectId) => {
    try {
      const peerId = await redisClient.hGet('p2p_users', userId.toString());
      if (peerId) {
        io.to(socket.id).emit('new_peer', peerId);
        console.log(`Sent peer: ${peerId} for user: ${userId}`);
      } else {
        console.log(`No peer found for user: ${userId}`);
      }
    } catch (error) {
      console.error(`Error retrieving peer for user: ${userId}`, error);
    }
  });
};
