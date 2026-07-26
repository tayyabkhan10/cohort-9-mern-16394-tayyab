export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  created_at: Date;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface PaginatedNotes {
  notes: Note[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
