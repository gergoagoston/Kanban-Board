import { Server, Socket } from 'socket.io';
import * as amqp from 'amqplib';

import { ServerToClientEvents, ClientToServerEvents, VotedUsersForTask } from './types';
import User from '../../model/user.model';
import redisClient from '../../connection/redisClient';
import { RabbitMqChatClient } from './amqpclient';
import Board from '../../model/board.model';
import Task from '../../model/task.model';

type VotedUsernamesWithEstimation = {
  userNames: string[];
  estimations: number[];
};
const getVotedUsers = async (taskId: string): Promise<VotedUsernamesWithEstimation> => {
  const users = await redisClient.hKeys(`votes:${taskId}`);
  const estimations = (await redisClient.hVals(`votes:${taskId}`)).map(Number);
  const usersId = await User.find({ _id: { $in: users } }).select('username');
  const userNames = usersId.map((user) => user.username);
  return { userNames, estimations };
};

type VotedUserRabbitMessage = {
  taskId: string;
  boardId: string;
  userNames: string[];
};

export const handleVoteSocket = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
  const rabbitConnection = await amqp.connect({});
  let client: RabbitMqChatClient;
  const exchange = 'amqp.topic.poker';
  socket.on('vote_task_notification', async (vote) => {
    //! console.log(`Vote received: ${vote.boardId} - ${vote.taskId} - ${vote.userId} - ${vote.vote}`);

    try {
      const result = await redisClient.hSet(`votes:${vote.taskId}`, vote.userId.toString(), vote.vote.toString());
      console.log(`Vote saved: ${result}`);
    } catch (err) {
      console.error('Error saving vote to Redis:', err);
    }
    try {
      const owner = await redisClient.hGet(`board:${vote.boardId}`, 'owner');
      if (owner) {
        //! console.log(`Board owner from Redis: ${owner}`);
        const channel = await rabbitConnection.createChannel();
        const votedUsers = await getVotedUsers(vote.taskId.toString());
        const userVoted: VotedUserRabbitMessage = {
          taskId: vote.taskId.toString(),
          boardId: vote.boardId.toString(),
          userNames: votedUsers.userNames,
        };
        //! console.log(`Publishing vote to board: ${vote.boardId} owner ${owner}`);
        channel.publish(exchange, `${vote.boardId}.${owner}`, Buffer.from(JSON.stringify(userVoted)));
      } else {
        console.log(`Owner not found in Redis for board ${vote.boardId}`);
      }
    } catch (err) {
      console.error('Error fetching board owner from Redis:', err);
    }

    try {
      const voteCount = await redisClient.hLen(`votes:${vote.taskId}`);
      //! console.log(`Vote count for task ${vote.taskId}: ${voteCount}`);
      const boardUsersCount = await redisClient.hGet(`board:${vote.boardId}`, 'userCount');
      //! console.log(`Board users count for board ${vote.boardId}: ${boardUsersCount}`);

      if (voteCount === Number(boardUsersCount)) {
        console.log(`All users have voted for task ${vote.taskId}`);
        await Task.findByIdAndUpdate(vote.taskId, { status: 1 });
      }
    } catch (err) {
      console.error('Error fetching from Redis:', err);
    }
  });

  socket.on('get_voted_users', async (taskId: string) => {
    const votedUSers = await getVotedUsers(taskId);
    const message: VotedUsersForTask = {
      taskId: taskId,
      userNames: votedUSers.userNames,
    };
    io.to(socket.id).emit('voted_users', message);
  });

  socket.on('get_voted_users_with_estimation', async (taskId: string) => {
    const votedUsers = await getVotedUsers(taskId);
    const message: VotedUsersForTask = {
      taskId: taskId,
      userNames: votedUsers.userNames,
      estimations: votedUsers.estimations,
    };
    io.to(socket.id).emit('voted_users', message);
  });

  socket.on('poker_watch', async (boardId: string, userId: string) => {
    console.log(`<> Socket ${socket.id} is on poker watch for board ${boardId}`);
    const routingPattern = `${boardId}.${userId}`;
    if (!client) {
      client = new RabbitMqChatClient(socket.id, exchange, routingPattern, rabbitConnection);
      await client.createClientQueue();
    } else {
      await client.changeRoutingKey(routingPattern);
    }
    try {
      const board = await Board.findById(boardId).select('owner users');
      if (board) {
        if (userId === board.owner.toString()) {
          await redisClient.hSet(`board:${boardId}`, 'socketId', socket.id);
          //! console.log(`Socket ID ${socket.id} set for board owner ${userId} in Redis`);
        }
        await redisClient.hSet(`board:${boardId}`, 'owner', board.owner.toString());
        //! console.log(`Board owner ${board.owner} added to Redis for board ${boardId}`);

        const userCount = board.users.length;
        await redisClient.hSet(`board:${boardId}`, 'userCount', userCount.toString());
        //! console.log(`Number of users ${userCount} added to Redis for board ${boardId}`);
        client.onVote((message: VotedUserRabbitMessage) => {
          // redisClient.hGet(`board:${message.boardId}`, "socketId").then((socketId) => {
          // 	console.log(`Socket ID for board owner of task ${message.taskId}: ${socketId}`);
          // 	if (socketId) {
          // console.log(`Emitting voted_users to ${client.clientId}`);
          const payload: VotedUsersForTask = {
            taskId: message.taskId,
            userNames: message.userNames,
          };
          io.to(client.clientId).emit('voted_users', payload);
          // } else {
          // 	console.log(`Socket ID not found for board owner of task ${message.taskId}`);
          // }
        });

        // })
      } else {
        console.log(`Board ${boardId} not found`);
      }
    } catch (err) {
      console.error('Error fetching board owner and users from database:', err);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`Client: ${socket.id} disconnected from Poker Watch`);
    if (client) {
      await client.destroyClientQueue();
    }
  });
};
