import { api } from './axios';
import type { Usuario } from '../types/Usuario';

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface AtualizarPerfilRequest {
  nome: string;
}

const alterarSenha = async (data: AlterarSenhaRequest): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>('/api/auth/minha-conta/alterar-senha', data);
  return response.data;
};

const atualizarPerfil = async (data: AtualizarPerfilRequest): Promise<Usuario> => {
  const response = await api.put<Usuario>('/api/auth/minha-conta/perfil', data);
  return response.data;
};

export const contaApi = {
  alterarSenha,
  atualizarPerfil,
};
