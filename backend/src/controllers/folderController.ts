import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import * as folderService from '../services/folderService';
import AppError from '../utils/AppError';

export const getFolders = catchAsync(async (req: Request, res: Response) => {
  const folders = await folderService.getFolders(req.user!.id);
  res.status(200).json({ success: true, data: folders });
});

export const createFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body; 
  if (!name) {
    return next(new AppError('Folder name is required', 400));
  }
  const folder = await folderService.createFolder(req.user!.id, name);
  res.status(201).json({ success: true, data: folder });
});

export const updateFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body; 
  if (!name) {
    return next(new AppError('Folder name is required', 400));
  }
  const folder = await folderService.updateFolder(req.user!.id, req.params.id, name);
  res.status(200).json({ success: true, data: folder });
});

export const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await folderService.deleteFolder(req.user!.id, req.params.id);
  res.status(200).json({ success: true, message: 'Folder deleted', data: result });
});