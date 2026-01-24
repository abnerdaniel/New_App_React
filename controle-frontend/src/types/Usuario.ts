export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface AuthResponse {
  id: number;
  nome: string;
  email: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  password: string;
}
