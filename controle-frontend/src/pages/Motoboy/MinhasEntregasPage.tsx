import { useState, useEffect, useCallback } from 'react';
import { useWaiter } from '../../contexts/WaiterContext';
import axios from 'axios';
import type { Pedido } from '../../types/Pedido';
import { MapPin, Phone, CheckCircle, Package, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024';

export function MinhasEntregasPage() {
  const { waiterUser, logout } = useWaiter();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
      if (!waiterUser) {
          navigate('/login-funcionario');
      }
  }, [waiterUser, navigate]);

  const fetchPedidos = useCallback(async () => {
    if (!waiterUser) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('waiterToken');
      // Using axios directly to avoid potential admin token conflict
      const response = await axios.get(`${API_URL}/api/pedidos/entregador/meus-pedidos`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao buscar entregas:', error);
    } finally {
      setLoading(false);
    }
  }, [waiterUser]);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 30000); 
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const handleLogout = () => {
      logout();
      navigate('/login-funcionario'); // Back to employee login
  }

  async function handleConfirmarEntrega(pedidoId: number) {
      if(!confirm("Confirmar que a entrega foi realizada?")) return;

      try {
          const token = localStorage.getItem('waiterToken');
          await axios.patch(`${API_URL}/api/pedidos/${pedidoId}/status`, "Entregue", {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
          });
          alert("Entrega confirmada com sucesso!");
          fetchPedidos();
      } catch (error) {
          console.error("Erro ao confirmar entrega:", error);
          alert("Erro ao confirmar entrega.");
      }
  }

  // Filter logic: Show "Saiu para Entrega" separately from "Entregue" (History)
  const entregasPendentes = pedidos.filter(p => p.status === 'Saiu para Entrega');
  const entregasConcluidas = pedidos.filter(p => p.status === 'Entregue');

  if (!waiterUser) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Minhas Entregas</h1>
          <p className="text-gray-500">Olá, {waiterUser.nome || 'Entregador'}</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={fetchPedidos} 
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              title="Atualizar"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
        </div>
      </div>

      {pedidos.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Nenhuma entrega atribuída a você no momento.</p>
        </div>
      )}

      {/* Entregas Ativas */}
      {entregasPendentes.length > 0 && (
        <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                <BikeIcon /> Em Curso ({entregasPendentes.length})
            </h2>
            <div className="grid gap-4">
                {entregasPendentes.map(pedido => (
                    <CardEntrega 
                        key={pedido.id} 
                        pedido={pedido} 
                        onConfirm={handleConfirmarEntrega} 
                        isHistory={false}
                    />
                ))}
            </div>
        </div>
      )}

      {/* Histórico Recente */}
      {entregasConcluidas.length > 0 && (
        <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-600 flex items-center gap-2">
                <CheckCircle size={20} /> Entregues Recentemente
            </h2>
             <div className="grid gap-4 opacity-75">
                {entregasConcluidas.map(pedido => (
                    <CardEntrega 
                        key={pedido.id} 
                        pedido={pedido} 
                        onConfirm={() => {}} 
                        isHistory={true}
                    />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

function CardEntrega({ pedido, onConfirm, isHistory }: { pedido: Pedido, onConfirm: (id: number) => void, isHistory: boolean }) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${isHistory ? 'border-green-500' : 'border-blue-500'}`}>
            <div className="flex justify-between items-start">
                <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">#{pedido.id}</span>
                        <span className="text-sm text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                            {new Date(pedido.dataVenda).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <h3 className="font-medium text-gray-900">{pedido.cliente?.nome || pedido.descricao}</h3>
                     
                     {/* Telefone Cliente */}
                     {pedido.cliente?.telefone && (
                         <div className="flex items-center gap-2 text-blue-600 mt-1 font-medium bg-blue-50 px-2 py-1 rounded w-fit">
                             <Phone size={14} />
                             <a href={`tel:${pedido.cliente.telefone}`}>{pedido.cliente.telefone}</a>
                         </div>
                     )}

                     <div className="flex items-start gap-2 mt-3 text-gray-600">
                        <MapPin size={16} className="mt-1 shrink-0" />
                        <div>
                            <p className="font-medium">
                                {pedido.enderecoDeEntrega 
                                    ? `${pedido.enderecoDeEntrega.logradouro}, ${pedido.enderecoDeEntrega.numero}` 
                                    : "Endereço não informado"}
                            </p>
                            {pedido.enderecoDeEntrega?.bairro && (
                                <p className="text-sm">{pedido.enderecoDeEntrega.bairro} - {pedido.enderecoDeEntrega.cidade}</p>
                            )}
                            {pedido.enderecoDeEntrega?.complemento && (
                                <p className="text-xs text-gray-500 mt-1">Comp: {pedido.enderecoDeEntrega.complemento}</p>
                            )}
                        </div>
                     </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="font-bold text-lg text-green-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((pedido.valorTotal ?? 0) / 100)}
                    </span>
                    <span className="text-sm text-gray-500">{pedido.metodoPagamento}</span>
                    
                    {!isHistory && (
                        <button
                            onClick={() => onConfirm(pedido.id)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all active:scale-95 w-full justify-center"
                        >
                            <CheckCircle size={18} />
                            Entregar
                        </button>
                    )}
                    {isHistory && (
                        <span className="mt-4 text-green-600 flex items-center gap-1 font-medium px-4 py-2 bg-green-50 rounded-lg">
                            <CheckCircle size={18} /> Entregue
                        </span>
                    )}
                </div>
            </div>

            {/* Itens Simplificados? ou Detalhes? */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                 <details className="text-sm text-gray-600 cursor-pointer">
                    <summary className="font-medium hover:text-gray-900">Ver Itens ({pedido.sacola.length})</summary>
                    <ul className="mt-2 space-y-1 pl-4 list-disc">
                        {pedido.sacola.map(item => (
                            <li key={item.id}>
                                {item.quantidade}x {item.nomeProduto}
                                {item.adicionais && item.adicionais.length > 0 && <span className="text-xs text-gray-400"> (+ adic.)</span>}
                            </li>
                        ))}
                    </ul>
                 </details>
            </div>
        </div>
    );
}

function BikeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
    )
}
