import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  updateUser: (nextUser: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('notes_token');
    const storedUser = localStorage.getItem('notes_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((nextUser: User, nextToken: string) => {
    localStorage.setItem('notes_token', nextToken);
    localStorage.setItem('notes_user', JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
  }, []); 

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    persistSession(result.user, result.token);
  }, [persistSession]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const result = await authApi.signup(name, email, password);
    persistSession(result.user, result.token);
  }, [persistSession]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await authApi.googleLogin(idToken);
    persistSession(result.user, result.token);
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('notes_token');
    localStorage.removeItem('notes_user');
    setUser(null);
    setToken(null);
  }, []);
  const updateUser = (nextUser: User) => {
  localStorage.setItem('notes_user', JSON.stringify(nextUser));
  setUser(nextUser);
};

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      signup,
      loginWithGoogle,
      updateUser,
      logout,
    }),
    [user, token, isLoading, login, signup, loginWithGoogle, updateUser, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};