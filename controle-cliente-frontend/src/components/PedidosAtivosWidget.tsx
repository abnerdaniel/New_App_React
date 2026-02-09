import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { useClientAuth } from '../context/ClientAuthContext';

interface Pedido {
  id: number;
  status: string;
  loja?: { nome: string };
  valorTotal: number;
}

export function PedidosAtivosWidget() {
  const { cliente } = useClientAuth();
  const navigate = useNavigate();
  const [pedidosAtivos, setPedidosAtivos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!cliente) return;

    const fetchPedidos = async () => {
      try {
        const response = await api.get(`/pedidos/cliente/${cliente.id}`);
        // Filtrar ativos: Não Entregue e Não Cancelado
        const ativos = response.data.filter((p: Pedido) => 
            p.status !== 'Entregue' && p.status !== 'Cancelado' && p.status !== 'Concluido'
        );
        setPedidosAtivos(ativos);
      } catch (error) {
        console.error("Erro buscar pedidos ativos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [cliente]);

  if (!cliente || (!loading && pedidosAtivos.length === 0)) return null;

  if (isMinimized) {
      return (
          <button 
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-24 right-4 z-40 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center animate-in scale-in-0"
          >
            <ShoppingBag size={24} />
            <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-600">
                {pedidosAtivos.length}
            </span>
          </button>
      );
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 w-full max-w-sm flex flex-col gap-2 pointer-events-none">
        <div className="flex justify-end pointer-events-auto pr-2">
            <button 
                onClick={() => setIsMinimized(true)}
                className="bg-gray-800/80 text-white p-1 rounded-full hover:bg-gray-900 transition-colors"
                title="Minimizar"
            >
                <ChevronDown size={20} />
            </button>
        </div>
        {pedidosAtivos.map(pedido => (
            <div 
                key={pedido.id}
                onClick={() => navigate(`/pedido/${pedido.id}`)}
                className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between cursor-pointer pointer-events-auto hover:bg-red-700 transition-colors animate-in slide-in-from-bottom-4 mx-4 md:mx-0"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <ShoppingBag size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Pedido #{pedido.id} em andamento</p>
                        <p className="text-xs text-red-100">{pedido.status} • {pedido.loja?.nome}</p>
                    </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold">
                    Acompanhar
                </div>
            </div>
        ))}
    </div>
  );
}
