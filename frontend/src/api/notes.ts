import apiClient from './client';
import type { ApiEnvelope, Note, PaginatedNotes } from '../types';

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const listNotes = async (params: ListParams = {}): Promise<PaginatedNotes> => {
  const res = await apiClient.get<ApiEnvelope<PaginatedNotes>>('/notes', { params });
  return res.data.data;
};

export const getNote = async (id: string): Promise<Note> => {
  const res = await apiClient.get<ApiEnvelope<Note>>(`/notes/${id}`);
  return res.data.data;
};

export const createNote = async (title: string, content: string): Promise<Note> => {
  const res = await apiClient.post<ApiEnvelope<Note>>('/notes', { title, content });
  return res.data.data;
};

export const updateNote = async (id: string, title: string, content: string): Promise<Note> => {
  const res = await apiClient.put<ApiEnvelope<Note>>(`/notes/${id}`, { title, content });
  return res.data.data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await apiClient.delete(`/notes/${id}`);
};
