import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useClientAuth } from '../context/ClientAuthContext';

interface Pedido {
  id: number;
  status: string;
  dataVenda: string;
  valorTotal: number; // em centavos
  loja?: { id: string; nome: string };
  sacola: { quantidade: number; nomeProduto: string }[];
}

export function MeusPedidos() {
  const { cliente, isAuthenticated } = useClientAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !cliente) {
        navigate('/identificacao');
        return;
    }

    const fetchPedidos = async () => {
      try {
        const response = await api.get(`/pedidos/cliente/${cliente.id}`);
        setPedidos(response.data);
      } catch (error) {
        console.error("Erro ao buscar histórico", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [cliente, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const isAtivo = (status: string) => 
    status !== 'Entregue' && status !== 'Cancelado' && status !== 'Concluido';

  const ativos = pedidos.filter(p => isAtivo(p.status));
  const historico = pedidos.filter(p => !isAtivo(p.status));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-lg text-gray-800">Meus Pedidos</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        
        {/* Ativos */}
        {ativos.length > 0 && (
            <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="text-red-600" size={20} />
                    Pedidos em Andamento
                </h2>
                <div className="space-y-4">
                    {ativos.map(pedido => (
                        <div 
                            key={pedido.id}
                            onClick={() => navigate(`/pedido/${pedido.id}`)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-red-100 cursor-pointer hover:border-red-200 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-gray-800">{pedido.loja?.nome}</p>
                                    <p className="text-xs text-gray-500">#{pedido.id}</p>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded-full">
                                    {pedido.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                                {pedido.sacola.map(item => `${item.quantidade}x ${item.nomeProduto}`).join(', ')}
                            </div>
                            <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-50">
                                <span className="font-bold text-gray-800">
                                    {(pedido.valorTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                    Acompanhar <ChevronRight size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Histórico */}
        <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="text-gray-400" size={20} />
                Histórico
            </h2>
            
            {historico.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-xl shadow-sm">
                    <p>Nenhum pedido anterior.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {historico.map(pedido => (
                        <div key={pedido.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-gray-800">{pedido.loja?.nome}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(pedido.dataVenda).toLocaleDateString('pt-BR')} • #{pedido.id}
                                    </p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    pedido.status === 'Cancelado' 
                                    ? 'bg-red-50 text-red-500' 
                                    : 'bg-green-50 text-green-600'
                                }`}>
                                    {pedido.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {pedido.sacola.map(item => `${item.quantidade}x ${item.nomeProduto}`).join(', ')}
                            </div>
                             <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-50">
                                <span className="font-medium text-gray-800">
                                    {(pedido.valorTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <button 
                                    onClick={() => navigate(`/loja/${pedido.loja?.id}`)} // Reorder goes to store
                                    className="text-red-600 font-bold hover:underline"
                                >
                                    Ver Loja
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

      </main>
    </div>
  );
}
