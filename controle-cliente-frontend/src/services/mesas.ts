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
  status: 'Livre' | 'Ocupada' | 'Pagamento' | 'Fechada';
  dataAbertura?: string;
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

export const adicionarItemMesa = async (mesaId: number, item: unknown) => {
    console.log(mesaId, item);
    return Promise.resolve(); 
};
