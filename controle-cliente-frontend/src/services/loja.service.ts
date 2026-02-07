import { api } from './api';
import type { Loja, Categoria } from '../types';

export const lojaService = {
  getAll: async (): Promise<Loja[]> => {
    try {
      const response = await api.get<any[]>('/vitrine'); 
      return response.data.map(loja => ({
        id: loja.id, // Corrigido: Backend retorna 'id' no LojaResumoDTO
        nome: loja.nome || 'Loja sem nome', // Corrigido: Backend retorna 'nome'
        descricao: loja.descricao || 'Loja parceira',
        imagemUrl: loja.imagemUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
        bannerUrl: loja.bannerUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000',
        avaliacao: loja.avaliacao || 4.8, 
        tempoEntregaMin: loja.tempoEntregaMin || 30,
        tempoEntregaMax: loja.tempoEntregaMax || 45,
        taxaEntrega: loja.taxaEntrega || 5.00,
        categoria: loja.categoria || 'Diversos',
        aberto: loja.aberta ?? true 
      }));
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      return [];
    }
  },
  
  async getById(id: string): Promise<Loja | undefined> {
    try {
      const response = await api.get<any>(`/vitrine/${id}`);
      const data = response.data;
      
      // Mapping VitrineDTO to Loja
      return {
        id: data.lojaId,
        nome: data.nomeLoja || 'Loja sem nome',
        descricao: 'Loja parceira', 
        imagemUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000', 
        bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000', 
        avaliacao: 4.8,
        tempoEntregaMin: 30,
        tempoEntregaMax: 45,
        taxaEntrega: 5.00,
        categoria: 'Diversos',
        aberto: data.aberta ?? true // Mapeando de 'aberta' (backend) para 'aberto' (frontend)
      };
    } catch (error) {
       console.error('Erro ao buscar loja:', error);
       return undefined;
    }
  },

  async getCardapio(id: string): Promise<Categoria[]> {
    try {
      const response = await api.get<any>(`/vitrine/${id}`);
      const data = response.data;

      if (!data.cardapio || !data.cardapio.categorias) return [];

      return data.cardapio.categorias.map((cat: any) => ({
          id: cat.id.toString(),
          nome: cat.nome,
          produtos: cat.produtos.map((prod: any) => ({
              id: prod.id.toString(),
              nome: prod.nome || prod.descricao, // Fallback
              descricao: prod.descricao,
              preco: prod.preco,
              imagemUrl: prod.urlImagem || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500', // Mock fallback se vazio
              categoriaId: cat.id.toString(),
              lojaId: id // O ID da loja vem do parametro da função, que é o mesmo da URL
          }))
      }));

    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      return [];
    }
  }
};
