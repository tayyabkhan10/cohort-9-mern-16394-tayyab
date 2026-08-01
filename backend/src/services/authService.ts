//src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import AppError from '../utils/AppError';
import { User } from '../types';
import { OAuth2Client } from 'google-auth-library';

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const generateToken = (user: Pick<User, 'id' | 'email'>): string => {
  const options: jwt.SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, options);
};

const sanitizeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at
});

export const signup = async ({ name, email, password }: SignupInput) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 409);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name, email, hashedPassword]
  );
  const user: User = result.rows[0];
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

export const login = async ({ email, password }: LoginInput) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user: User | undefined = result.rows[0];
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  const isMatch = await bcrypt.compare(password, user.password_hash as string);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

export const getProfile = async (userId: string) => {
  const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);
  const user: User | undefined = result.rows[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError('Invalid Google token', 401);
  }

  const { email, name, sub: googleId } = payload;

  let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  let user: User = result.rows[0];

  if (!user) {
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, googleId]
    );
    user = insertResult.rows[0];
  } else if (!user.google_id) {
    await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};