export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
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
