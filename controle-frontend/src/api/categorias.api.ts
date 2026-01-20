import { api } from './axios'
import type { Categoria } from '../types/Categoria'

export const categoriaApi = {
  listar: () =>
    api.get<Categoria[]>("/categorias/lista"),

  criar: (data: Omit<Categoria, "id">) =>
    api.post("/categorias/criar", data),
};