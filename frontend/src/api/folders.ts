import apiClient from './client';
import type { ApiEnvelope, Folder } from '../types';

export const listFolders = async (): Promise<Folder[]> => {
  const res = await apiClient.get<ApiEnvelope<Folder[]>>('/folders');
  return res.data.data;
};

export const createFolder = async (name: string): Promise<Folder> => {
  const res = await apiClient.post<ApiEnvelope<Folder>>('/folders', { name });
  return res.data.data;
};

export const updateFolder = async (id: string, name: string): Promise<Folder> => {
  const res = await apiClient.put<ApiEnvelope<Folder>>(`/folders/${id}`, { name });
  return res.data.data;
};

export const deleteFolder = async (id: string): Promise<void> => {
  await apiClient.delete(`/folders/${id}`);
};