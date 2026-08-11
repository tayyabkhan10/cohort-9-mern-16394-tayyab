export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthRequest extends Express.Request {
  user?: AuthUser;
}
