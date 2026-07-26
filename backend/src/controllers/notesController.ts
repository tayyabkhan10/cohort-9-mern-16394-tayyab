import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import * as notesService from '../services/notesService';
import AppError from '../utils/AppError';
import { emitToUser } from '../config/socket';

export const getNotes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { search, page, limit } = req.query;
  const result = await notesService.getNotes(req.user!.id, {
    search: search as string | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined
  });
  res.status(200).json({ success: true, data: result });
});

export const getNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const note = await notesService.getNoteById(req.user!.id, req.params.id);
  res.status(200).json({ success: true, data: note });
});

export const createNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  if (!title) {
    return next(new AppError('Title is required', 400));
  }
  const note = await notesService.createNote(req.user!.id, { title, content });
  emitToUser(req.user!.id, 'note:created', note);
  res.status(201).json({ success: true, data: note });
});

export const updateNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  if (!title) {
    return next(new AppError('Title is required', 400));
  }
  const note = await notesService.updateNote(req.user!.id, req.params.id, { title, content });
  emitToUser(req.user!.id, 'note:updated', note);
  res.status(200).json({ success: true, data: note });
});

export const deleteNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await notesService.deleteNote(req.user!.id, req.params.id);
  emitToUser(req.user!.id, 'note:deleted', result);
  res.status(200).json({ success: true, message: 'Note deleted successfully' });
});
