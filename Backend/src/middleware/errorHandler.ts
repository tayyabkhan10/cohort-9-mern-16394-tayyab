import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import AppError from '../utils/AppError';

const errorHandler = (err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as AppError).statusCode || 500;
  const isOperational = (err as AppError).isOperational || false;
  logger.error({ err }, err.message);
  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Something went wrong'
  });
};

export default errorHandler;
