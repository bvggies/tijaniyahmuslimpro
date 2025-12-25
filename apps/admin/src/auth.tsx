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
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/api/auth-me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Admin auth: failed to reach API in fetchMe', err);
      // Don't clear token on network errors - might be temporary
      // Only clear if it's a 401/403 (unauthorized)
      return;
    }
    
    if (!res.ok) {
      // Only clear token if unauthorized (401) or forbidden (403)
      if (res.status === 401 || res.status === 403) {
        setUser(null);
        setAccessToken(null);
        window.localStorage.removeItem('admin_accessToken');
      }
      return;
    }
    
    try {
      const json = await res.json();
      if (json.user) {
        setUser(json.user);
      }
    } catch (err) {
      console.error('Admin auth: failed to parse response in fetchMe', err);
    }
  };

  const login = async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/api/auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      console.error('Admin login: network or CORS error', err);
      throw new Error(
        'Unable to reach admin API. Please check your connection or API base URL (REACT_APP_API_BASE_URL).',
      );
    }

    let json: any;
    try {
      json = await res.json();
    } catch {
      // Non-JSON response (e.g. HTML error page)
      throw new Error('Unexpected response from server while signing in.');
    }

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



