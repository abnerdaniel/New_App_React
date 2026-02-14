import axios from 'axios';

// Vamos assumir que o Client App também pode acessar a API do backend
// Precisamos configurar a URL base. Geralmente está em services/api.ts ou similar.
// Vou criar um arquivo novo para garantir, mas o ideal seria reusar.

const API_URL = 'http://localhost:5024'; // Ajustar conforme env

export interface Mesa {
  id: number;
  lojaId: string;
  numero: number;
  nome?: string;
  clienteNomeTemporario?: string;
  status: 'Livre' | 'Ocupada' | 'Pagamento' | 'Fechada';
  dataAbertura?: string;
}

export const listarMesas = async (lojaId: string) => {
  const response = await axios.get<Mesa[]>(`${API_URL}/api/mesas/${lojaId}`);
  return response.data;
};

export const abrirMesa = async (id: number, nomeCliente?: string) => {
  const response = await axios.post(`${API_URL}/api/mesas/${id}/abrir`, { nomeCliente });
  return response.data;
};

export const adicionarItemMesa = async (mesaId: number, item: any) => {
    // Placeholder para uso futuro
    console.log(mesaId, item);
    return Promise.resolve(); 
};
