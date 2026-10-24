import api from '@/shared/lib/axios';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  getMe: async (): Promise<AuthResponse> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
