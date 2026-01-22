import { api } from './axios'
import type { Transacao } from '../types/Transacao'

const listarPorPessoa = async(pessoaId: number): Promise<Transacao[]> =>{
const response = await api.get<Transacao[]>(`/api/transacao/lista/${pessoaId}`);
return response.data;
}

const criar = async(data: Omit<Transacao, "id">) =>{
await api.post("/api/transacao/criar", data);
}

const deletar = async(id: number) =>{
await api.delete(`/api/transacao/deleta/${id}`);
}


export const transacaoApi = {
  listarPorPessoa,
  criar,
  deletar,
};