import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { CurrentUser } from '../types';
import { apiGet, apiSend } from './api';

interface AuthApi {
  user: CurrentUser | null;
  loading: boolean;
  signup: (input: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  login: (input: { usernameOrEmail: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (input: { displayName?: string; bio?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiGet<{ user: CurrentUser }>('/auth/me');
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signup = useCallback(async (input: { username: string; email: string; password: string; displayName?: string }) => {
    const res = await apiSend<{ user: CurrentUser }>('POST', '/auth/signup', input);
    setUser(res.user);
  }, []);

  const login = useCallback(async (input: { usernameOrEmail: string; password: string }) => {
    const res = await apiSend<{ user: CurrentUser }>('POST', '/auth/login', input);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await apiSend('POST', '/auth/logout');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (input: { displayName?: string; bio?: string; avatar?: string }) => {
    const res = await apiSend<{ user: CurrentUser }>('PATCH', '/users/me', input);
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
