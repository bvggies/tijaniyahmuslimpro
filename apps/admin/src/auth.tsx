import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER' | 'USER';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = window.localStorage.getItem('admin_accessToken');
    if (token) {
      setAccessToken(token);
      void fetchMe(token);
    }
    // Only run on mount - fetchMe is stable and doesn't need to be in deps
  }, []);

  const fetchMe = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth-me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      setUser(null);
      setAccessToken(null);
      window.localStorage.removeItem('admin_accessToken');
      return;
    }
    const json = await res.json();
    setUser(json.user);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? 'Unable to sign in');
    }
    const token: string = json.accessToken;
    setAccessToken(token);
    window.localStorage.setItem('admin_accessToken', token);
    await fetchMe(token);
    navigate('/dashboard', { replace: true });
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    window.localStorage.removeItem('admin_accessToken');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;
  return children;
}

export function RequireRole({ children, roles }: { children: JSX.Element; roles: Role[] }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !roles.includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, roles, navigate]);

  if (!user || !roles.includes(user.role)) return null;
  return children;
}



