import { api } from './axios';

export interface Mesa {
  id: number;
  lojaId: string;
  numero: number;
  nome?: string;
  clienteNomeTemporario?: string;
  status: 'Livre' | 'Ocupada' | 'Pagamento' | 'Fechada' | 'Chamando' | 'Cozinha' | string;
  pedidoAtualId?: number;
  pedidoAtual?: {
      id: number;
      status?: string;
      dataVenda?: string;
      desconto?: number;
      funcionarioId?: number;
      funcionario?: {
          id: number;
          nome: string;
      };
      sacola: Array<{
          id: number;
          quantidade: number;
          precoUnitario: number;
          nomeProduto?: string;
          precoVenda: number;
          comboId?: number;
          combo?: {
              nome: string;
              itens: Array<{
                  id: number;
                  quantidade: number;
                  produtoLojaId: number;
                  produtoLoja?: {
                      produto?: {
                          nome: string;
                      };
                  };
              }>;
          };
          produtoLoja?: {
              produto?: {
                  nome: string;
                  preco: number;
              }
          };
          status?: string;
      }>;
      total?: number;
  };
  dataAbertura?: string;
}

export const listarMesas = async (lojaId: string): Promise<Mesa[]> => {
  const response = await api.get<Mesa[]>(`/api/mesas/${lojaId}`);
  return response.data;
};

// ...

export const atualizarStatusItem = async (itemId: number, status: string): Promise<void> => {
  await api.patch(`/api/mesas/pedido-item/${itemId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
  });
};

export const atualizarStatusMesa = async (mesaId: number, status: string): Promise<void> => {
  await api.patch(`/api/mesas/${mesaId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
  });
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

export const removerItemPedido = async (itemId: number): Promise<void> => {
  await api.delete(`/api/mesas/pedido-item/${itemId}`);
};

export const aplicarDesconto = async (pedidoId: number, desconto: number): Promise<void> => {
  await api.patch(`/api/mesas/pedido/${pedidoId}/desconto`, { desconto });
};

export interface ProdutoLojaItem {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoriaNome: string; // Added from backend
  imagemUrl?: string; // Added from backend DTO
  isCombo?: boolean;
}

export const listarProdutosLoja = async (lojaId: string): Promise<ProdutoLojaItem[]> => {
  const response = await api.get<ProdutoLojaItem[]>(`/api/mesas/produtos/${lojaId}`);
  return response.data;
};

export const adicionarItemPedido = async (pedidoId: number, itemId: number, isCombo: boolean, quantidade: number = 1): Promise<void> => {
  const payload = {
    produtoLojaId: !isCombo ? itemId : null,
    comboId: isCombo ? itemId : null,
    quantidade
  };
  await api.post(`/api/mesas/pedido/${pedidoId}/item`, payload);
};
