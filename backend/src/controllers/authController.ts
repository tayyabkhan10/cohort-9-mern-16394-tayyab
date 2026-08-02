import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import * as authService from '../services/authService';
import AppError from '../utils/AppError';
import cloudinary from '../config/cloudinary';
const streamifier = require('streamifier');
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
export const googleLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;
  if (!idToken) {
    return next(new AppError('Google idToken is required', 400));
  }
  const { user, token } = await authService.googleLogin(idToken);
  res.status(200).json({ success: true, data: { user, token } });
});


export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, bio } = req.body;
  const user = await authService.updateProfile(req.user!.id, { name, bio });
  res.status(200).json({ success: true, data: user });
});

export const uploadAvatar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('No image file provided', 400));
  }

  const uploadStream = () =>
    new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'marginalia/avatars', transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }] },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(req.file!.buffer).pipe(stream);
    });

  const avatarUrl = await uploadStream();
  const user = await authService.updateAvatar(req.user!.id, avatarUrl);
  res.status(200).json({ success: true, data: user });
});