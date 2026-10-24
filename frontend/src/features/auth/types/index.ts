import { User } from '@/shared/types';

export interface LoginPayload {
  login: string;
  password?: string;
}

export interface RegisterPayload {
  nik: string;
  nama_lengkap: string;
  no_kk: string;
  alamat?: string;
  no_telp?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}
