import pool from '../config/db';
import AppError from '../utils/AppError';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export const getFolders = async (userId: string): Promise<Folder[]> => {
  const result = await pool.query(
    `SELECT f.*, COUNT(n.id)::int AS note_count
     FROM folders f
     LEFT JOIN notes n ON n.folder_id = f.id
     WHERE f.user_id = $1
     GROUP BY f.id
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const createFolder = async (userId: string, name: string, color: string): Promise<Folder> => {
  const result = await pool.query(
    'INSERT INTO folders (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, color]
  );
  return result.rows[0];
};

export const updateFolder = async (
  userId: string,
  folderId: string,
  name: string,
  color: string
): Promise<Folder> => {
  const result = await pool.query(
    'UPDATE folders SET name = $1, color = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
    [name, color, folderId, userId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Folder not found', 404);
  }
  return result.rows[0];
};

export const deleteFolder = async (userId: string, folderId: string): Promise<{ id: string }> => {
  const result = await pool.query('DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id', [
    folderId,
    userId
  ]);
  if (result.rows.length === 0) {
    throw new AppError('Folder not found', 404);
  }
  return result.rows[0];
};