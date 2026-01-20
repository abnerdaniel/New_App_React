import { api } from './axios'
import type { Transacao } from '../types/Transacao'

export const transacaoApi = {
  listarPorPessoa: (pessoaId: number) =>
    api.get<Transacao[]>(`/transacao/lista/${pessoaId}`),

  criar: (data: Omit<Transacao, "id">) =>
    api.post("/transacao/criar", data),

  deletar: (id: number) =>
    api.delete(`/transacao/deleta/${id}`),
};