import apiClient from './client';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.url as string;
};