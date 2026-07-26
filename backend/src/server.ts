import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import logger from './config/logger';
import { initSocket } from './config/socket';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
