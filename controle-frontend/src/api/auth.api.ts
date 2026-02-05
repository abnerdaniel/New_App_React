import { api } from './axios'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/Usuario'

const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/google-login', { idToken });
  return response.data;
};

export const authApi = {
  login,
  register,
  googleLogin,
};
