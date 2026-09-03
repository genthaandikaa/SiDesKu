import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/shared/lib/axios';
import { User } from '@/shared/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (login: string, password?: string) => Promise<boolean>;
  register: (formData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  quickLoginAs: (username: string) => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; message: string; user: User }>;
  updatePassword: (data: any) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (loginStr: string, passwordStr = 'password123'): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', {
        login: loginStr.trim(),
        password: passwordStr,
      });

      if (response.data.success) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return true;
      }
      return false;
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (formData: any): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return true;
      }
      return false;
    } catch (err: any) {
      throw err;
    }
  };

  const quickLoginAs = async (username: string) => {
    setLoading(true);
    await login(username, 'password123');
    setLoading(false);
  };

  const updateProfile = async (data: any) => {
    const response = await api.post('/auth/profile', data);
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const updatePassword = async (data: any) => {
    const response = await api.post('/auth/password', data);
    return response.data;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLoginAs,
        updateProfile,
        updatePassword,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
