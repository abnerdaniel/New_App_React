import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPedidosFila, updateObservacao, updateStatus } from '../../api/pedidos.api';
import { api } from '../../api/axios';
import type { Pedido } from '../../types/Pedido';
import { Smile, Meh, Frown, Power, Truck, ShoppingBag, MapPin, Bike, Phone, MessageCircle } from 'lucide-react';
import { formatPhoneForWhatsapp } from '../../utils/formatters';

export function DeliveryPage() {
  const { activeLoja } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [aceitandoPedidos, setAceitandoPedidos] = useState(true);
  const [togglingDelivery, setTogglingDelivery] = useState(false);

  // Dispatch States
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [motoboys, setMotoboys] = useState<{id: number, nome: string, telefone?: string}[]>([]);
  const [loadingMotoboys, setLoadingMotoboys] = useState(false);

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

  const fetchMotoboys = async () => {
    if (!activeLoja?.id) return;
    setLoadingMotoboys(true);
    try {
        const response = await api.get(`/api/funcionarios/loja/${activeLoja.id}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drivers = response.data.filter((f: any) => f.cargo?.toLowerCase().includes('entregador') && f.ativo);
        setMotoboys(drivers);
    } catch (error) {
        console.error("Erro ao buscar entregadores", error);
        alert("Erro ao carregar lista de entregadores.");
    } finally {
        setLoadingMotoboys(false);
    }
  };

  const handleOpenDispatchModal = (pedido: Pedido) => {
      setSelectedPedido(pedido);
      setShowDispatchModal(true);
      fetchMotoboys();
  };

  const handleDispatch = async (entregadorId: number) => {
      if(!selectedPedido) return;
      try {
          await api.post(`/api/pedidos/${selectedPedido.id}/despachar`, entregadorId, {
            headers: { 'Content-Type': 'application/json' }
          });
          setShowDispatchModal(false);
          setSelectedPedido(null);
          fetchPedidos();
          // alert("Pedido despachado com sucesso!"); // Optional feedback
      } catch (error) {
          console.error("Erro ao despachar", error);
          alert("Erro ao despachar pedido.");
      }
  };

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

  // Rewrite return to include modal
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
                <div className="text-xs opacity-80 truncate flex flex-col gap-1 mt-0.5">
                   {pedido.isRetirada ? (
                    <span className="flex items-center gap-1"><ShoppingBag size={12} /> Retirada na Loja</span>
                  ) : pedido.enderecoDeEntrega ? (
                    <span className="flex items-center gap-1"><MapPin size={12} /> {pedido.enderecoDeEntrega.bairro}, {pedido.enderecoDeEntrega.logradouro}</span>
                  ) : (
                    <span className="flex items-center gap-1"><MapPin size={12} /> Entrega (Endereço não disponível)</span>
                  )}
                  
                  {(pedido.cliente?.telefone) && (
                      <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-blue-800 font-semibold cursor-pointer text-xs bg-blue-50 px-2 py-1 rounded" onClick={() => window.open(`tel:${pedido.cliente?.telefone}`)}>
                              <Phone size={12} /> {pedido.cliente.telefone}
                          </span>
                          <a 
                                href={`https://wa.me/${formatPhoneForWhatsapp(pedido.cliente.telefone)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-bold transition-colors"
                                title="Abrir WhatsApp"
                            >
                                <MessageCircle size={12} />
                                WhatsApp
                            </a>
                      </div>
                  )}
                </div>

                {/* Assigned Motoboy Info */}
                {pedido.entregador && (
                    <div className="mt-2 bg-white/50 p-1.5 rounded text-xs border border-purple-200">
                        <p className="font-bold text-purple-800 flex items-center gap-1"><Bike size={12}/> {pedido.entregador.nome}</p>
                        {pedido.entregador.telefone && <p className="text-purple-600 ml-4">{pedido.entregador.telefone}</p>}
                    </div>
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
                <div className="flex justify-between items-center bg-white/60 p-2 rounded flex-wrap gap-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getStatusBadge(pedido.status)}`}>
                    {pedido.status}
                  </span>
                  
                  {/* Status Actions */}
                  {pedido.status === 'Aguardando Aceitação' && (
                       <button onClick={() => adiantarEtapa(pedido)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700">Aceitar</button>
                  )}
                  {pedido.status === 'Em Preparo' && (
                       <button onClick={() => adiantarEtapa(pedido)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-medium hover:bg-green-700">Pronto</button>
                  )}
                  {pedido.status === 'Pronto' && !pedido.entregadorId && (
                      <button onClick={() => handleOpenDispatchModal(pedido)} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded font-medium hover:bg-black flex items-center gap-1">
                          <Bike size={12}/> Despachar
                      </button>
                  )}
                  {pedido.status === 'Saiu para Entrega' && (
                       <button onClick={() => adiantarEtapa(pedido)} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded font-medium hover:bg-green-800">Concluir</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Bike className="text-brand-primary" />
                        Selecionar Entregador
                    </h2>
                    <button onClick={() => setShowDispatchModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
                </div>
                
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Escolha um motoboy disponível para o pedido <strong>#{selectedPedido?.id}</strong>.
                    </p>
                    
                    {loadingMotoboys ? (
                        <div className="text-center py-8 text-gray-400">Carregando entregadores...</div>
                    ) : motoboys.length === 0 ? (
                        <div className="text-center py-6 text-red-500 bg-red-50 rounded-lg border border-red-100">
                            Nenhum entregador "Entregador" ativo encontrado.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {motoboys.map(motoboy => (
                                <button
                                    key={motoboy.id}
                                    onClick={() => handleDispatch(motoboy.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{motoboy.nome}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {motoboy.telefone || 'Sem telefone'}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 text-brand-primary font-bold">
                                        Selecionar
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
