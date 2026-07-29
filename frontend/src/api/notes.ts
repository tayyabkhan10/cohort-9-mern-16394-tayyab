import apiClient from './client';
import type { ApiEnvelope, Note, PaginatedNotes } from '../types';

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  folder_id?: string;
}

interface NotePayload {
  title: string;
  content: string;
  folder_id?: string | null;
}

export const listNotes = async (params: ListParams = {}): Promise<PaginatedNotes> => {
  const res = await apiClient.get<ApiEnvelope<PaginatedNotes>>('/notes', { params });
  return res.data.data;
};

export const getNote = async (id: string): Promise<Note> => {
  const res = await apiClient.get<ApiEnvelope<Note>>(`/notes/${id}`);
  return res.data.data;
};

export const createNote = async (payload: NotePayload): Promise<Note> => {
  const res = await apiClient.post<ApiEnvelope<Note>>('/notes', payload);
  return res.data.data;
};

export const updateNote = async (id: string, payload: NotePayload): Promise<Note> => {
  const res = await apiClient.put<ApiEnvelope<Note>>(`/notes/${id}`, payload);
  return res.data.data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await apiClient.delete(`/notes/${id}`);
};