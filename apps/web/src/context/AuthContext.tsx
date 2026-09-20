import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'OPERATOR' | 'ADMIN';
  avatar?: string;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<boolean>;
  logout: () => void;
  loginAsDemo: (role: 'ADMIN' | 'OPERATOR' | 'CITIZEN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('patchpulse_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem('patchpulse_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('patchpulse_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const res = await api.login({ email, password: pass });
    if (res.success && res.data) {
      localStorage.setItem('patchpulse_token', res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string, role = 'CITIZEN'): Promise<boolean> => {
    const res = await api.register({ name, email, password: pass, role });
    if (res.success && res.data) {
      localStorage.setItem('patchpulse_token', res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('patchpulse_token');
    setToken(null);
    setUser(null);
  };

  const loginAsDemo = async (role: 'ADMIN' | 'OPERATOR' | 'CITIZEN') => {
    const creds = {
      ADMIN: { email: 'admin@patchpulse.demo', pass: 'Pass@12345' },
      OPERATOR: { email: 'operator@patchpulse.demo', pass: 'Pass@12345' },
      CITIZEN: { email: 'citizen@patchpulse.demo', pass: 'Pass@12345' },
    }[role];

    await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
