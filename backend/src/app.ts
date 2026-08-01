
import './types/express';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import logger from './config/logger';
import authRoutes from './routes/authRoutes';
import notesRoutes from './routes/notesRoutes';
import uploadRoutes from './routes/uploadRoutes';
import folderRoutes from './routes/folderRoutes';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/folders', folderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;