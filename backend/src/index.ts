import { getMongoDb } from './connection/mongo';
import { handleError } from './middleware/errorhandling';
import express from 'express';
import http from 'http';

import getUserApiRoutes from './routes/rest/user.route';
import getAuthApiRoutes from './routes/rest/auth.route';
import getTaskApiRoutes from './routes/rest/task.route';
import getBoardApiRoutes from './routes/rest/board.route';
import { initSocket } from './routes/socket/socketManager';
import getMessageApiRoutes from './routes/rest/message.route';

const port = parseInt(process.argv[2]) || 8081; // Get port from input argument or default to 3000
console.log('port: ', port);

(async () => {
  await getMongoDb();
  const app = express();
  const server = http.createServer(app);

  initSocket(server);

  app.use('/api/users', getUserApiRoutes());
  app.use('/api/boards', getBoardApiRoutes());
  app.use('/api/tasks', getTaskApiRoutes());
  app.use('/api/auth', getAuthApiRoutes());
  app.use('/api/messages', getMessageApiRoutes());

  app.use(handleError);

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}/...`);
  });
})();
