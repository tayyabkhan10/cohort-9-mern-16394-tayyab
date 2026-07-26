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
