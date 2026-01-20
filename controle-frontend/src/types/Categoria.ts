export type Finalidade = "despesa" | "receita" | "ambas";

export interface Categoria {
  id: number;
  descricao: string;
  finalidade: Finalidade;
}
