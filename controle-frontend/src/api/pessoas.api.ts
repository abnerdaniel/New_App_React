import { api } from './axios'
import type { Pessoa } from '../types/Pessoa'

export interface PessoaRequest {
  nome: string;
  idade: number;
}

const listar = async (): Promise<Pessoa[]> => {
  const response = await api.get<Pessoa[]>('/api/pessoas/lista');
  return response.data;
};

const criar = async (
  data: PessoaRequest
): Promise<Pessoa> => {
  const response = await api.post<Pessoa>(
    '/api/pessoas/criar',
    data
  );
  return response.data;
};

const atualizar = async (
  data: Pessoa
): Promise<Pessoa> => {
  const response = await api.put<Pessoa>(
    '/api/pessoas/atualiza',
    data
  );
  return response.data;
};
const deletar = async (id: number): Promise<void> => {
  await api.delete(`/api/pessoas/deleta/${id}`);
};

export const pessoaApi = {
  listar,
  criar,
  atualizar,
  deletar,
};