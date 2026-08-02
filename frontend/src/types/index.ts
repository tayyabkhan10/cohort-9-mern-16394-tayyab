export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
}
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  note_count?: number;
}

export interface Note {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotes {
  notes: Note[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}