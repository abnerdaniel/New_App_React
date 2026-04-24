import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/axios';

export interface TipoProduto {
  id: number;
  nome: string;
  icone?: string;
  ativo: boolean;
}

export function useTiposProduto(lojaId?: string) {
  const [tipos, setTipos] = useState<TipoProduto[]>([]);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    if (!lojaId) return;
    setLoading(true);
    try {
      const res = await api.get('/api/tipos-produto', { params: { lojaId } });
      setTipos(res.data);
    } catch (err) {
      console.error('Erro ao carregar tipos de produto:', err);
    } finally {
      setLoading(false);
    }
  }, [lojaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (nome: string) => {
    await api.post('/api/tipos-produto', { nome }, { params: { lojaId } });
    await carregar();
  };

  const atualizar = async (id: number, nome: string, ativo = true) => {
    await api.put(`/api/tipos-produto/${id}`, { nome, ativo }, { params: { lojaId } });
    await carregar();
  };

  const excluir = async (id: number) => {
    await api.delete(`/api/tipos-produto/${id}`, { params: { lojaId } });
    await carregar();
  };

  return { tipos, loading, carregar, criar, atualizar, excluir };
}
