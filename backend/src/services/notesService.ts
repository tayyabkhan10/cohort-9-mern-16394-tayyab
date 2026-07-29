import pool from '../config/db';
import AppError from '../utils/AppError';
import { Note, PaginatedNotes } from '../types';

interface NoteInput {
  title: string;
  content?: string;
  folder_id?: string | null;
  color?: string;
}

interface ListOptions {
  search?: string;
  page?: number;
  limit?: number;
  folder_id?: string;
}

export const getNotes = async (userId: string, options: ListOptions = {}): Promise<PaginatedNotes> => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const offset = (page - 1) * limit;

  const params: any[] = [userId];
  let whereClause = 'WHERE user_id = $1';

  if (options.search) {
    params.push(`%${options.search}%`);
    whereClause += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
  }

  if (options.folder_id) {
    params.push(options.folder_id);
    whereClause += ` AND folder_id = $${params.length}`;
  }

  const countResult = await pool.query(`SELECT COUNT(*) FROM notes ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const dataResult = await pool.query(
    `SELECT * FROM notes ${whereClause} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    notes: dataResult.rows,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

export const getNoteById = async (userId: string, noteId: string): Promise<Note> => {
  const result = await pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
  if (result.rows.length === 0) {
    throw new AppError('Note not found', 404);
  }
  return result.rows[0];
};

export const createNote = async (userId: string, { title, content, folder_id, color }: NoteInput): Promise<Note> => {
  const result = await pool.query(
    'INSERT INTO notes (user_id, title, content, folder_id, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, title, content || null, folder_id || null, color || 'yellow']
  );
  return result.rows[0];
};

export const updateNote = async (
  userId: string,
  noteId: string,
  { title, content, folder_id, color }: NoteInput
): Promise<Note> => {
  const result = await pool.query(
    `UPDATE notes SET title = $1, content = $2, folder_id = $3, color = $4, updated_at = now()
     WHERE id = $5 AND user_id = $6 RETURNING *`,
    [title, content || null, folder_id || null, color || 'yellow', noteId, userId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Note not found', 404);
  }
  return result.rows[0];
};

export const deleteNote = async (userId: string, noteId: string): Promise<{ id: string }> => {
  const result = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [noteId, userId]);
  if (result.rows.length === 0) {
    throw new AppError('Note not found', 404);
  }
  return result.rows[0];
};