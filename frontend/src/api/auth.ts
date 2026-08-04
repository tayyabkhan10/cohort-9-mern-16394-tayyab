import apiClient from './client';
import type { ApiEnvelope, AuthResponse, User } from '../types';

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/signup', { name, email, password });
  return res.data.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', { email, password });
  return res.data.data;
};

export const getMe = async (): Promise<User> => {
  const res = await apiClient.get<ApiEnvelope<User>>('/auth/me');
  return res.data.data;
};
export const googleLogin = async (idToken: string) => {
  const res = await apiClient.post('/auth/google', { idToken });
  return res.data.data as { user: User; token: string };
};
export const updateProfile = async (data: { name?: string; bio?: string }) => {
  const res = await apiClient.patch('/auth/me', data);
  return res.data.data as User;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await apiClient.post('/auth/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data as User;
};
export const removeAvatar = async () => {
  const res = await apiClient.delete('/auth/me/avatar');
  return res.data.data as User;
};