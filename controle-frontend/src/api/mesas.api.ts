import { api } from './axios';

export interface Mesa {
  id: number;
  lojaId: string;
  numero: number;
  nome?: string;
  clienteNomeTemporario?: string;
  status: 'Livre' | 'Ocupada' | 'Pagamento' | 'Fechada';
  pedidoAtualId?: number;
  pedidoAtual?: {
      id: number;
      sacola: Array<{
          quantidade: number;
          precoUnitario: number;
          produtoLoja?: {
              produto?: {
                  nome: string;
                  preco: number;
              }
          }
      }>;
      total?: number; // Se o backend calcular
  }; // Tipar melhor se precisar (Pedido)
  dataAbertura?: string; // DateTime ISO
}

export const listarMesas = async (lojaId: string): Promise<Mesa[]> => {
  const response = await api.get<Mesa[]>(`/api/mesas/${lojaId}`);
  return response.data;
};

export const configurarMesas = async (lojaId: string, quantidade: number): Promise<void> => {
  await api.post('/api/mesas/configurar', { lojaId, quantidade });
};

export const atualizarApelido = async (id: number, apelido: string): Promise<void> => {
  await api.patch(`/api/mesas/${id}/apelido`, JSON.stringify(apelido), {
      headers: { 'Content-Type': 'application/json' }
  });
};

export const abrirMesa = async (id: number, nomeCliente?: string): Promise<Mesa> => {
  const response = await api.post<Mesa>(`/api/mesas/${id}/abrir`, { nomeCliente });
  return response.data;
};

export const liberarMesa = async (id: number): Promise<void> => {
  await api.post(`/api/mesas/${id}/liberar`);
};
