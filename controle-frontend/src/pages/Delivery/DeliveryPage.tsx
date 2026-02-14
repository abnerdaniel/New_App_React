import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPedidosFila, updateObservacao, updateStatus } from '../../api/pedidos.api';
import { api } from '../../api/axios';
import type { Pedido } from '../../types/Pedido';
import { Smile, Meh, Frown, Power, Truck, ShoppingBag, MapPin } from 'lucide-react';

export function DeliveryPage() {
  const { activeLoja } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [aceitandoPedidos, setAceitandoPedidos] = useState(true);
  const [togglingDelivery, setTogglingDelivery] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch delivery status from loja
  const fetchLojaStatus = useCallback(async () => {
    if (!activeLoja?.id) return;
    try {
      const response = await api.get(`/api/loja/${activeLoja.id}`);
      setAceitandoPedidos(response.data.aceitandoPedidos ?? true);
    } catch (error) {
      console.error('Erro ao buscar status delivery', error);
    }
  }, [activeLoja?.id]);

  const fetchPedidos = useCallback(async () => {
    if (!activeLoja?.id) return;
    try {
      setLoading(true);
      const data = await getPedidosFila(activeLoja.id);
      // Filter only delivery orders (no mesa number)
      const deliveryOrders = data.filter(p => !p.numeroMesa);
      setPedidos(deliveryOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos', error);
    } finally {
      setLoading(false);
    }
  }, [activeLoja?.id]);

  useEffect(() => {
    fetchPedidos();
    fetchLojaStatus();
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, [fetchPedidos, fetchLojaStatus]);

  const handleToggleDelivery = async () => {
    if (!activeLoja?.id) return;
    try {
      setTogglingDelivery(true);
      const newValue = !aceitandoPedidos;
      await api.patch(`/api/loja/${activeLoja.id}/delivery`, JSON.stringify(newValue), {
        headers: { 'Content-Type': 'application/json' }
      });
      setAceitandoPedidos(newValue);
    } catch (error) {
      console.error('Erro ao alterar status delivery', error);
      alert('Erro ao alterar status do delivery');
    } finally {
      setTogglingDelivery(false);
    }
  };

  const handleStatusChange = async (pedidoId: number, newStatus: string) => {
    try {
      await updateStatus(pedidoId, newStatus);
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleObservacaoBlur = async (pedidoId: number, currentObs: string | undefined, newObs: string) => {
    if (currentObs === newObs) return;
    try {
      await updateObservacao(pedidoId, newObs);
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, observacao: newObs } : p));
    } catch (error) {
      console.error('Erro ao atualizar observação', error);
      alert('Erro ao atualizar observação');
    }
  };

  const adiantarEtapa = (pedido: Pedido) => {
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
    return Math.floor((current - start) / 60000);
  };

  const getStatusColorAndIcon = (minutos: number) => {
    if (minutos < 30) return { color: 'bg-green-100 border-green-300 text-green-800', icon: <Smile size={32} className="text-green-600" /> };
    if (minutos < 40) return { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: <Meh size={32} className="text-yellow-600" /> };
    return { color: 'bg-red-100 border-red-300 text-red-800', icon: <Frown size={32} className="text-red-600" /> };
  };

  const getStatusBadge = (status: string | undefined) => {
    const s = status || 'Pendente';
    const styles: Record<string, string> = {
      'Pendente': 'bg-gray-200 text-gray-700',
      'Aguardando Aceitação': 'bg-orange-100 text-orange-700',
      'Em Preparo': 'bg-blue-100 text-blue-700',
      'Pronto': 'bg-green-100 text-green-700',
      'Saiu para Entrega': 'bg-purple-100 text-purple-700',
    };
    return styles[s] || 'bg-gray-200 text-gray-700';
  };

  if (loading && pedidos.length === 0) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Truck size={28} />
            Delivery
            <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border">{activeLoja?.nome}</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerencie seus pedidos de delivery em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Toggle Delivery */}
          <button
            onClick={handleToggleDelivery}
            disabled={togglingDelivery}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm border ${
              aceitandoPedidos
                ? 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
            }`}
          >
            <Power size={18} className={togglingDelivery ? 'animate-spin' : ''} />
            {aceitandoPedidos ? 'Delivery Ativo' : 'Delivery Desligado'}
          </button>

          <button onClick={fetchPedidos} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm">
            Atualizar
          </button>
        </div>
      </div>

      {/* Delivery OFF banner */}
      {!aceitandoPedidos && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <Power size={24} className="text-red-500" />
          <div>
            <p className="font-bold text-red-700">Delivery desligado</p>
            <p className="text-sm text-red-600">Novos pedidos delivery não serão aceitos. Clique em "Delivery Desligado" para reativar.</p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 border shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{pedidos.length}</p>
          <p className="text-xs text-gray-500">Na fila</p>
        </div>
        <div className="bg-white rounded-lg p-3 border shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{pedidos.filter(p => p.status === 'Em Preparo').length}</p>
          <p className="text-xs text-gray-500">Em preparo</p>
        </div>
        <div className="bg-white rounded-lg p-3 border shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{pedidos.filter(p => p.status === 'Pronto').length}</p>
          <p className="text-xs text-gray-500">Prontos</p>
        </div>
        <div className="bg-white rounded-lg p-3 border shadow-sm text-center">
          <p className="text-2xl font-bold text-purple-600">{pedidos.filter(p => p.status === 'Saiu para Entrega').length}</p>
          <p className="text-xs text-gray-500">Em entrega</p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pedidos.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhum pedido delivery na fila</p>
            <p className="text-sm mt-1">Novos pedidos aparecerão automaticamente aqui.</p>
          </div>
        )}
        
        {pedidos.map(pedido => {
          const minutos = getTempoEspera(pedido.dataVenda);
          const { color, icon } = getStatusColorAndIcon(minutos);

          return (
            <div key={pedido.id} className={`border-2 rounded-lg shadow-sm p-4 flex flex-col gap-3 transition-colors ${color}`}>
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">#{pedido.id}</span>
                  {pedido.numeroFila && <span className="text-xs bg-white/60 px-1.5 py-0.5 rounded font-mono">Fila #{pedido.numeroFila}</span>}
                  <span className="text-xs font-mono opacity-75">{new Date(pedido.dataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex flex-col items-end">
                  {icon}
                  <span className="text-xs font-bold mt-1">{minutos} min</span>
                </div>
              </div>

              {/* Client + Delivery Info */}
              <div className="border-b pb-2 border-black/10">
                <p className="font-semibold text-sm truncate">
                  {pedido.cliente?.nome ? `${pedido.cliente.nome}` : `Cliente #${pedido.clienteId}`}
                </p>
                <p className="text-xs opacity-80 truncate flex items-center gap-1 mt-0.5">
                  {pedido.isRetirada ? (
                    <><ShoppingBag size={12} /> Retirada na Loja</>
                  ) : pedido.enderecoDeEntrega ? (
                    <><MapPin size={12} /> {pedido.enderecoDeEntrega.bairro}, {pedido.enderecoDeEntrega.logradouro}, {pedido.enderecoDeEntrega.numero}</>
                  ) : (
                    <><MapPin size={12} /> Entrega (Endereço não disponível)</>
                  )}
                </p>
                {pedido.metodoPagamento && (
                  <p className="text-xs opacity-60 mt-0.5">💳 {pedido.metodoPagamento.replace('_', ' ')}</p>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto max-h-40 bg-white/50 p-2 rounded text-sm space-y-1">
                {pedido.sacola.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-dashed border-gray-300 last:border-0 pb-1 last:pb-0">
                    <span>{item.quantidade}x {item.nomeProduto || item.produtoLoja?.produto?.nome || 'Item'}</span>
                  </div>
                ))}
                {pedido.observacao && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs italic text-gray-600">
                    <strong>Obs Cliente:</strong> {pedido.observacao}
                  </div>
                )}
              </div>

              {/* Internal Observation */}
              <div className="relative">
                <label className="text-xs font-bold block mb-1">Observação Interna:</label>
                <textarea 
                  className="w-full text-sm p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  rows={2}
                  defaultValue={pedido.observacao}
                  onBlur={(e) => handleObservacaoBlur(pedido.id, pedido.observacao, e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                <div className="flex justify-between items-center bg-white/60 p-2 rounded">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getStatusBadge(pedido.status)}`}>
                    {pedido.status}
                  </span>
                  {pedido.status !== 'Entregue' && (
                    <button 
                      onClick={() => adiantarEtapa(pedido)}
                      className="text-xs bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded font-medium transition"
                    >
                      Avançar ▸
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
