import { Server, Socket } from 'socket.io';
import * as amqp from 'amqplib';
import { ServerToClientEvents, ClientToServerEvents } from './types';
import redisClient from '../../connection/redisClient';
import { RabbitMqChatClient, TaskChange } from './amqpclient';
import mongoose from 'mongoose';
import TaskMapper from '../../mapper/task.mapper';

const exchange = 'amqp.topic.board';

/**
 * Handles changes in the MongoDB Task collection and publishes relevant updates to RabbitMQ.
 *
 * This function sets up a change stream on the Task collection to monitor insert, update, and delete operations.
 * Depending on the type of change, it performs the following actions:
 * - For delete operations, it removes related voting entries from Redis and publishes the change to RabbitMQ.
 * - For insert and update operations, it fetches the updated task, and publishes the change to RabbitMQ.
 * - If a task's status changes back to 0 during an update, it also removes related voting entries from Redis, because it is "re-voted".
 *
 */
// export const handleDatabaseChanges = async () => {
//   const connection = await amqp.connect({}); // RabbitMQ Publisher Connection
//   const channel = await connection.createChannel(); // RabbitMQ Channel

//   const db = mongoose.connection;

//   const taskCollection = db.collection('tasks');
//   const changeStream = taskCollection.watch([], {
//     fullDocument: 'updateLookup',
//     fullDocumentBeforeChange: 'required', // Ensure the document's state before deletion is available
//   });

//   changeStream.on('change', async (change) => {
//     console.info('Change detected in Task collection. Type:', change.operationType);

//     if (change.operationType === 'delete') {
//       const boardId = change.fullDocumentBeforeChange?.boardId.toString();
//       const routingKey = `${boardId}`;
//       const message = JSON.stringify({
//         type: change.operationType,
//         task: change.fullDocumentBeforeChange,
//       });

//       // Remove all entries related to the deleted task from Redis
//       const taskId = change.documentKey._id.toString();
//       console.log(`Deleting votes from Redis for task ${taskId}`);
//       await redisClient.del(`votes:${taskId}`);

//       // send the change with RabbitMQ
//       channel.publish(exchange, routingKey, Buffer.from(message));
//     } else if (change.operationType === 'insert' || change.operationType === 'update') {
//       const rawTask = await taskCollection.findOne(change.documentKey._id);
//       if (rawTask) {
//         const taskOutDto = await TaskMapper.modelToDto(rawTask);

//         const routingKey = `${taskOutDto.boardId}`;
//         const message = JSON.stringify({
//           type: change.operationType,
//           task: taskOutDto,
//         });

//         // If the task status changes to 0, Remove all entries related to the task from Redis
//         if (change.operationType === 'update' && change.fullDocument && change.fullDocument.status === 0) {
//           const taskId = change.documentKey._id.toString();
//           console.log(`Deleting votes from Redis for task ${taskId} due to status change to 0`);
//           await redisClient.del(`votes:${taskId}`);
//         }

//         // send the change with RabbitMQ
//         channel.publish(exchange, routingKey, Buffer.from(message));
//       }
//     }
//   });
// };

/**
 *
 * This function sets up every board specific socket event.
 *
 * Events:
 * - "board_watch": Sets up a RabbitMQ client to get the changes real time.
 * - "disconnect": Cleans up resources when the client disconnects.
 *
 * Task Change Handling:
 * - "insert": Emits an "inserted_task_notification" event with the task details.
 * - "update": Emits an "updated_task_notification" event with the task details.
 * - "delete": Emits a "removed_task_notification" event with the task ID.
 */
export const handleBoardSocket = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
  console.log(`New client connected: ${socket.id}`);
  let client: RabbitMqChatClient | null = null;

  socket.on('board_watch', async (boardId: string) => {
    console.log(`<> Socket ${socket.id} is watching board ${boardId}`);
    if (!client) {
      const rabbitConnection = await amqp.connect({});
      const exchange = 'amqp.topic.board';
      client = new RabbitMqChatClient(socket.id, exchange, boardId, rabbitConnection);
      await client.createClientQueue();
    } else {
      await client.changeRoutingKey(boardId);
    }

    client.onTaskChange((message: TaskChange) => {
      if (client) {
        switch (message.type) {
          case 'insert':
            io.to(client.clientId).emit('inserted_task_notification', message.task);
            break;
          case 'update':
            io.to(client.clientId).emit('updated_task_notification', message.task);
            break;
          case 'delete':
            io.to(client.clientId).emit('removed_task_notification', message.task._id);
            break;
        }
      }
    });
  });

  socket.on('disconnect', async () => {
    console.log(`Client: ${socket.id} disconnected from Board Watch`);
    if (client) {
      await client.destroyClientQueue();
    }
  });
};
