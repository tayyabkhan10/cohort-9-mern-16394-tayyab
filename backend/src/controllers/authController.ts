import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import * as authService from '../services/authService';
import AppError from '../utils/AppError';

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new AppError('Name, email and password are required', 400));
  }
  const { user, token } = await authService.signup({ name, email, password });
  res.status(201).json({ success: true, data: { user, token } });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }
  const { user, token } = await authService.login({ email, password });
  res.status(200).json({ success: true, data: { user, token } });
});

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await authService.getProfile(req.user!.id);
  res.status(200).json({ success: true, data: user });
});
