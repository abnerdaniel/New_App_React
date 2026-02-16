import axios from 'axios';

const API_URL = 'http://localhost:5024'; // Ajustar conforme env

const getAuthHeaders = () => {
  const token = localStorage.getItem('waiterToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Mesa {
  id: number;
  lojaId: string;
  numero: number;
  nome?: string;
  pedidoAtualId?: number;
  clienteNomeTemporario?: string;
  status: 'Livre' | 'Ocupada' | 'Pagamento' | 'Fechada' | 'Cozinha' | 'Chamando' | string;
  dataAbertura?: string;
  pedidoAtual?: {
      id: number;
      sacola: Array<{
          id: number;
          quantidade: number;
          precoVenda: number;
          nomeProduto?: string;
          produtoLoja?: {
              produto?: {
                  nome: string;
              }
          };
          status?: string;
      }>;
      total?: number;
  };
}

export const listarMesas = async (lojaId: string) => {
  const response = await axios.get<Mesa[]>(`${API_URL}/api/mesas/${lojaId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const abrirMesa = async (id: number, nomeCliente?: string) => {
  const response = await axios.post(`${API_URL}/api/mesas/${id}/abrir`, { nomeCliente }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const atualizarStatusItem = async (itemId: number, status: string) => {
  await axios.patch(`${API_URL}/api/mesas/pedido-item/${itemId}/status`, JSON.stringify(status), {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
};

export const atualizarStatusMesa = async (mesaId: number, status: string) => {
  const response = await axios.patch(`${API_URL}/api/mesas/${mesaId}/status`, JSON.stringify(status), {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const adicionarItemMesa = async (mesaId: number, item: unknown) => {
    console.log(mesaId, item);
    return Promise.resolve(); 
};
