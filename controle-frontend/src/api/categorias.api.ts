import { api } from './axios'
import type { Categoria } from '../types/Categoria'

const listar = async (): Promise<Categoria[]> =>{
const response = await api.get<Categoria[]>('/api/categorias/lista');
return response.data;
}
    
const criar = async (data: Omit<Categoria, "id">) => {
const response = await api.post("/api/categorias/criar", data);
return response.data;
}


export const categoriaApi = {
  listar,
  criar,
};