import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import logger from '../config/logger';

export const uploadImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('No image file provided', 400));
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'notes-app', resource_type: 'image' },
    (error, result) => {
      if (error || !result) {
        logger.error({ err: error }, 'Cloudinary upload failed');
        return next(new AppError('Image upload failed', 502));
      }
      res.status(201).json({
        success: true,
        data: { url: result.secure_url, publicId: result.public_id }
      });
    }
  );

  stream.end(req.file.buffer);
});