import { api } from "./axios";
import type { Pessoa } from "../types/Pessoa";

export const listarPessoas = async (): Promise<Pessoa[]> => {
  const response = await api.get<Pessoa[]>("/pessoas/lista");
  return response.data;
};

export const criarPessoa = async (nome: string, idade: number): Promise<void> => {
  await api.post("/pessoas/criar", { nome, idade });
};

export const deletarPessoa = async (id: number): Promise<void> => {
  await api.delete(`/pessoas/deleta/${id}`);
};
