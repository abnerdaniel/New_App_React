import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024';

export interface PedidoFila {
  id: number;
  status: string; // 'Pendente' | 'Em Preparo' | 'Pronto' | 'Entregue'
  dataVenda: string;
  numeroMesa?: number; // Se null, é Delivery/Balcão
  cliente?: {
    nome: string;
  };
  clienteNomeTemporario?: string; // Para mesas sem cadastro
  observacao?: string;
  sacola: Array<{
    id: number;
    nomeProduto?: string;
    produtoLoja?: {
      produto?: {
        nome: string;
      }
    };
    quantidade: number;
    status?: string; // Status do Item: 'Pendente' | 'Preparando' | 'Entregue'
    observacao?: string;
    comboId?: number;
    combo?: {
        nome: string;
        itens: Array<{
            id: number;
            produtoLoja?: {
                produto?: {
                    nome: string;
                }
            };
            quantidade: number;
        }>
    };
  }>;
}

export const listarPedidosFila = async (lojaId: string) => {
  const token = localStorage.getItem('waiterToken');
  const response = await axios.get<PedidoFila[]>(`${API_URL}/api/pedidos/fila/${lojaId}`, {
      headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const atualizarStatusPedido = async (pedidoId: number, status: string) => {
    const token = localStorage.getItem('waiterToken');
    await axios.patch(`${API_URL}/api/pedidos/${pedidoId}/status`, JSON.stringify(status), {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const atualizarStatusItem = async (itemId: number, status: string) => {
    const token = localStorage.getItem('waiterToken');
    await axios.patch(`${API_URL}/api/mesas/pedido-item/${itemId}/status`, JSON.stringify(status), {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};
