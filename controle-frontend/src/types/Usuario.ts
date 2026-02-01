export interface LojaResumo {
  id: string;
  nome: string;
  logoUrl?: string;
}

export interface FuncionarioResumo {
  id: string;
  lojaId?: string;
  cargo: string;
  ativo: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  lojas?: LojaResumo[];
  funcionarios?: FuncionarioResumo[];
}

export interface AuthResponse {
  id: string;
  nome: string;
  email: string;
  token: string;
  lojas: LojaResumo[];
  funcionarios: FuncionarioResumo[];
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  password: string;
}
