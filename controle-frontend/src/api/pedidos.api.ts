import { api } from './axios';
import type { Pedido } from '../types/Pedido';

export const getPedidosFila = async (lojaId: string): Promise<Pedido[]> => {
  const response = await api.get<Pedido[]>(`/api/pedidos/fila/${lojaId}`);
  return response.data;
};

export const updateStatus = async (pedidoId: number, novoStatus: string): Promise<Pedido> => {
  const response = await api.patch<Pedido>(`/api/pedidos/${pedidoId}/status`, JSON.stringify(novoStatus), {
    headers: {
        'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateObservacao = async (pedidoId: number, novaObservacao: string): Promise<Pedido> => {
    const response = await api.patch<Pedido>(`/api/pedidos/${pedidoId}/observacao`, JSON.stringify(novaObservacao), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};
