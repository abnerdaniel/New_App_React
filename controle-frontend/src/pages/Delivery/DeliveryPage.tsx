import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPedidosFila, updateObservacao, updateStatus } from '../../api/pedidos.api';
import type { Pedido } from '../../types/Pedido';
import { Smile, Meh, Frown } from 'lucide-react';

export function DeliveryPage() {
  const { activeLoja } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  // Atualiza o "agora" a cada minuto para atualizar os contadores visuais
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchPedidos = useCallback(async () => {
    if (!activeLoja?.id) return;
    try {
      setLoading(true);
      const data = await getPedidosFila(activeLoja.id);
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos', error);
    } finally {
      setLoading(false);
    }
  }, [activeLoja?.id]);

  useEffect(() => {
    fetchPedidos();
    // Polling a cada 30 segundos para novos pedidos
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const handleStatusChange = async (pedidoId: number, newStatus: string) => {
    try {
      await updateStatus(pedidoId, newStatus);
      fetchPedidos(); // Recarrega para garantir
    } catch (error) {
      console.error('Erro ao atualizar status', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleObservacaoBlur = async (pedidoId: number, currentObs: string | undefined, newObs: string) => {
    if (currentObs === newObs) return;
    try {
      await updateObservacao(pedidoId, newObs);
      // Atualiza localmente para evitar refresh total se desejar, ou chama fetchPedidos
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, observacao: newObs } : p));
    } catch (error) {
      console.error('Erro ao atualizar observação', error);
      alert('Erro ao atualizar observação');
    }
  };

  const adiantarEtapa = (pedido: Pedido) => {
      // O backend usa strings livres, mas vamos tentar mapear
      // Se o status atual for 'Aguardando Aceitação', move para 'Em Preparo'
      
      let nextStatus = '';
      const current = pedido.status || 'Pendente';
      
      if (current === 'Aguardando Aceitação' || current === 'Pendente') nextStatus = 'Em Preparo';
      else if (current === 'Em Preparo') nextStatus = 'Pronto';
      else if (current === 'Pronto') nextStatus = 'Saiu para Entrega';
      else if (current === 'Saiu para Entrega') nextStatus = 'Entregue';
      
      if (nextStatus) handleStatusChange(pedido.id, nextStatus);
  };

  const getTempoEspera = (dataVenda: string) => {
    const start = new Date(dataVenda).getTime();
    const current = now.getTime();
    const diffMs = current - start;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const getStatusColorAndIcon = (minutos: number) => {
    if (minutos < 30) return { color: 'bg-green-100 border-green-300 text-green-800', icon: <Smile size={32} className="text-green-600" /> };
    if (minutos < 40) return { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: <Meh size={32} className="text-yellow-600" /> };
    return { color: 'bg-red-100 border-red-300 text-red-800', icon: <Frown size={32} className="text-red-600" /> };
  };

  if (loading && pedidos.length === 0) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Delivery <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border">Loja: {activeLoja?.nome}</span>
            </h1>
            <p className="text-gray-500 mt-1">Gerencie seus pedidos em tempo real.</p>
        </div>
        <button onClick={fetchPedidos} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Atualizar Lista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pedidos.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
                Nenhum pedido na fila no momento.
            </div>
        )}
        
        {pedidos.map(pedido => {
          const minutos = getTempoEspera(pedido.dataVenda);
          const { color, icon } = getStatusColorAndIcon(minutos);

          return (
            <div key={pedido.id} className={`border-2 rounded-lg shadow-sm p-4 flex flex-col gap-3 transition-colors ${color}`}>
              {/* Cabeçalho do Card */}
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">#{pedido.id}</span>
                    <span className="text-xs font-mono opacity-75">{new Date(pedido.dataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 <div className="flex flex-col items-end">
                    {icon}
                    <span className="text-xs font-bold mt-1">{minutos} min</span>
                 </div>
              </div>

              {/* Cliente */}
              <div className="border-b pb-2 border-black/10">
                <p className="font-semibold text-sm truncate" title={`Cliente ID: ${pedido.clienteId}`}>
                    Cliente {pedido.clienteId}
                </p>
                <p className="text-xs opacity-80 truncate">{pedido.isRetirada ? 'Retirada na Loja' : 'Entrega'}</p>
              </div>

              {/* Itens */}
              <div className="flex-1 overflow-y-auto max-h-40 bg-white/50 p-2 rounded text-sm space-y-1">
                 {pedido.sacola.map((item, idx) => (
                     <div key={idx} className="flex justify-between border-b border-dashed border-gray-300 last:border-0 pb-1 last:pb-0">
                         <span>{item.quantidade}x {item.nomeProduto}</span>
                     </div>
                 ))}
                 {pedido.observacao && (
                     <div className="mt-2 pt-2 border-t border-gray-200 text-xs italic text-gray-600">
                         <strong>Obs Cliente:</strong> {pedido.observacao}
                     </div>
                 )}
              </div>

              {/* Obs Interna */}
              <div className="relative">
                 <label className="text-xs font-bold block mb-1">Observação Interna:</label>
                 <textarea 
                    className="w-full text-sm p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    rows={2}
                    defaultValue={pedido.observacao} // Usando observacao do pedido como "interna" ou "geral"? 
                    // O campo no banco é `Observacao`. Se o cliente manda obs, vem aqui.
                    // Se o lojista edita, sobrescreve.
                    // Ideal seria ter `ObservacaoInterna`, mas o requisito diz "modificado status e adicionado observações".
                    // Vou assumir que edita a mesma observação por enquanto.
                    onBlur={(e) => handleObservacaoBlur(pedido.id, pedido.observacao, e.target.value)}
                 />
              </div>

              {/* Ações */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                  <div className="flex justify-between items-center bg-white/60 p-2 rounded">
                      <span className="text-xs font-bold uppercase">{pedido.status}</span>
                      <button 
                        onClick={() => adiantarEtapa(pedido)}
                        className="text-xs bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition"
                      >
                        Avançar
                      </button>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

