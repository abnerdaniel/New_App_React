import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/axios';
import { Clock, User, CheckCircle, Truck, UtensilsCrossed, AlertCircle, ChefHat, MapPin, Bike, Phone, X, MessageCircle, Printer } from 'lucide-react';
import { formatPhoneForWhatsapp } from '../../utils/formatters';
import { printReceipt } from '../../utils/printReceipt';
import { PedidoStatus } from '../../constants/pedidoStatus';

interface PedidoMonitor {
  id: number;
  clienteId?: number;
  cliente?: {
    nome: string;
    telefone?: string;
  };
  funcionarioId?: number;
  funcionario?: {
    nome: string;
  };
  entregadorId?: number;
  entregador?: {
      id: number;
      nome: string;
      telefone?: string;
  };
  enderecoDeEntrega?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
  };
  dataVenda: string;
  valorTotal: number;
  status: string;
  isRetirada: boolean;
  metodoPagamento: string;
  trocoPara?: number;
  observacao?: string;
  descricao?: string; // Field for custom name/description
  numeroMesa?: number;
  sacola: {
    id: number;
    nomeProduto: string;
    quantidade: number;
    adicionais?: {
        nomeProduto?: string; 
    }[];
    observacao?: string;
    status?: string; 
    produtoLoja?: {
        descricao?: string;
        produto?: {
            nome: string;
        }
    };
  }[];
}

interface Entregador {
    id: number;
    nome: string;
    telefone?: string;
    cargo?: string;
}

export function MonitorPedidos() {
  const { activeLoja } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'todos' | 'delivery' | 'local' | 'historico'>('todos');
  
  // Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoMonitor | null>(null);
  const [motoboys, setMotoboys] = useState<Entregador[]>([]);
  const [loadingMotoboys, setLoadingMotoboys] = useState(false);

  const loadPedidos = useCallback(async () => {
    if (!activeLoja?.id) return;
    try {
      // setLoading(true); // Don't block UI on refresh
      const response = await api.get(`/api/pedidos/fila/${activeLoja.id}`);
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos', error);
    } finally {
      setLoading(false);
    }
  }, [activeLoja?.id]);

  useEffect(() => {
    if (activeLoja?.id) {
      loadPedidos();
      const interval = setInterval(loadPedidos, 15000); // Auto-refresh every 15s
      return () => clearInterval(interval);
    }
  }, [activeLoja?.id, loadPedidos]);

  const updateStatus = async (pedidoId: number, newStatus: string) => {
    if (!confirm(`Mudar status para ${newStatus}?`)) return;
    try {
        await api.patch(`/api/pedidos/${pedidoId}/status`, newStatus, {
            headers: { 'Content-Type': 'application/json' }
        });
        loadPedidos();
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert('Erro ao atualizar status');
    }
  };

  const updateItemStatus = async (itemId: number, newStatus: string) => {
      try {
          await api.patch(`/api/pedidos/itens/${itemId}/status`, newStatus, {
              headers: { 'Content-Type': 'application/json' }
          });
          loadPedidos(); // Refresh to check if order status changed too
      } catch (error) {
          console.error("Erro ao atualizar item", error);
          alert('Erro ao atualizar item');
      }
  };

  const handleOpenDispatchModal = async (pedido: PedidoMonitor) => {
      setSelectedPedido(pedido);
      setShowDispatchModal(true);
      setLoadingMotoboys(true);
      try {
          // Fetch Funcionarios and Filter by Role 'Entregador'
          const response = await api.get(`/api/funcionarios/loja/${activeLoja?.id}`);
          const allStaff = response.data;
          // Filter: Active staff
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const drivers = allStaff.filter((f: any) => f.ativo);
          setMotoboys(drivers);
      } catch (error) {
          console.error("Erro ao buscar entregadores", error);
          alert("Erro ao carregar lista de entregadores.");
      } finally {
          setLoadingMotoboys(false);
      }
  };

  const handleDispatch = async (entregadorId: number) => {
      if(!selectedPedido) return;

      try {
          await api.post(`/api/pedidos/${selectedPedido.id}/despachar`, entregadorId, {
            headers: { 'Content-Type': 'application/json' }
          });
          setShowDispatchModal(false);
          setSelectedPedido(null);
          loadPedidos();
      } catch (error) {
          console.error("Erro ao despachar", error);
          alert("Erro ao despachar pedido.");
      }
  };

  const filteredPedidos = pedidos.filter(p => {
    // Determine if it's finished (history)
    const isFinished = p.status === PedidoStatus.Concluido || p.status === PedidoStatus.Cancelado || p.status === PedidoStatus.Entregue;
    
    // If we're looking at history, only show finished orders
    if (filterType === 'historico') return isFinished;
    
    // If not history, hide finished orders from active tabs
    if (isFinished) return false;

    const isMesa = (p.numeroMesa && p.numeroMesa > 0);
    const hasAddress = p.enderecoDeEntrega && (p.enderecoDeEntrega.logradouro || p.enderecoDeEntrega.bairro);
    
    let isDelivery = false;
    let isLocal = false;

    if (isMesa) {
        isLocal = true;
    } else if (hasAddress) {
        isDelivery = true;
    } else {
        isLocal = true; 
    }
    
    if (filterType === 'delivery') return isDelivery;
    if (filterType === 'local') return isLocal;
    return true; // 'todos' tab (but we already filtered out completed above)
  });

  const getStatusColor = (status: string) => {
      switch(status) {
          case PedidoStatus.Pendente: 
          case PedidoStatus.AguardandoAceitacao: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case PedidoStatus.EmPreparo: return 'bg-blue-100 text-blue-800 border-blue-200';
          case PedidoStatus.Pronto: return 'bg-green-100 text-green-800 border-green-200';
          case PedidoStatus.SaiuParaEntrega:
          case PedidoStatus.Entregue: 
            return 'bg-purple-100 text-purple-800 border-purple-200';
          case PedidoStatus.Concluido: return 'bg-gray-100 text-gray-800 border-gray-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  const getTempoDecorrido = (data: string) => {
      const diff = new Date().getTime() - new Date(data).getTime();
      const mins = Math.floor(diff / 60000);
      return `${mins} min`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <UtensilsCrossed className="text-brand-primary" />
                Monitor de Pedidos
            </h1>
            <p className="text-sm text-gray-500">Gerencie a fila de produção e entregas</p>
          </div>
          
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg gap-1">
              <button onClick={() => setFilterType('todos')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === 'todos' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Todos Activos</button>
              <button onClick={() => setFilterType('local')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === 'local' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Local / Mesa</button>
              <button onClick={() => setFilterType('delivery')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === 'delivery' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Delivery</button>
              <button onClick={() => setFilterType('historico')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === 'historico' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Histórico Hoje</button>
          </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {loading ? (
             <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                 <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                 Carregando pedidos...
             </div>
          ) : filteredPedidos.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                 <AlertCircle size={48} className="opacity-20" />
                 <p className="text-lg font-medium">Nenhum pedido na fila.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full h-fit overflow-y-auto pb-20 custom-scrollbar pr-2">
                 {filteredPedidos.map(pedido => (
                     <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow h-fit">
                         {/* Card Header */}
                         <div className={`p-3 border-b rounded-t-xl flex justify-between items-start ${getStatusColor(pedido.status)}`}>
                             <div>
                                 <span className="text-xs font-bold uppercase tracking-wider block mb-1">{pedido.status}</span>
                                 <div className="font-bold text-lg flex items-center gap-2">
                                     #{pedido.id}
                                     {pedido.numeroMesa && pedido.numeroMesa > 0 ? (
                                         <span className="text-xs bg-white/50 px-2 py-0.5 rounded">Mesa {pedido.numeroMesa}</span>
                                     ) : (pedido.enderecoDeEntrega && (pedido.enderecoDeEntrega.logradouro || pedido.enderecoDeEntrega.bairro)) ? (
                                         <span className="text-xs bg-white/50 px-2 py-0.5 rounded flex items-center gap-1"><Truck size={10}/> Delivery</span>
                                     ) : (
                                         <span className="text-xs bg-white/50 px-2 py-0.5 rounded">Balcão</span>
                                     )}
                                 </div>
                             </div>
                             <div className="text-right flex items-start gap-2">
                                 <button 
                                     onClick={() => printReceipt(pedido, activeLoja)}
                                     title="Imprimir Cupom"
                                     className="p-1 hover:bg-white/40 rounded transition-colors"
                                 >
                                     <Printer size={16} />
                                 </button>
                                 <div>
                                     <div className="flex items-center justify-end gap-1 text-xs font-bold opacity-80">
                                         <Clock size={12} />
                                         {getTempoDecorrido(pedido.dataVenda)}
                                     </div>
                                     <div className="text-xs opacity-70 mt-0.5">
                                         {new Date(pedido.dataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Card Body */}
                         <div className="p-4 flex-1 space-y-4">
                             {/* Info Cliente/Funcionario */}
                             <div className="text-sm space-y-1">
                                 {pedido.cliente ? (
                                     <div className="flex items-start gap-2 text-gray-700">
                                         <User size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                         <div className="w-full">
                                             <p className="font-bold truncate" title={pedido.cliente.nome}>{pedido.cliente.nome}</p>
                                             {pedido.cliente.telefone && (
                                            <div className="flex items-center gap-2 text-blue-600 font-medium flex-wrap mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Phone size={12} />
                                                    <a href={`tel:${pedido.cliente.telefone}`} className="hover:underline">{pedido.cliente.telefone}</a>
                                                </div>
                                                <a 
                                                    href={`https://wa.me/${formatPhoneForWhatsapp(pedido.cliente.telefone)}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 text-xs font-bold transition-colors"
                                                    title="Abrir WhatsApp"
                                                >
                                                    <MessageCircle size={12} />
                                                    WhatsApp
                                                </a>
                                            </div>
                                             )}
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="flex items-center gap-2 text-gray-700">
                                         <User size={16} className="text-brand-primary" />
                                         <span className="font-bold truncate">{pedido.descricao || "Cliente não identificado"}</span>
                                     </div>
                                 )}

                                 {/* Motoboy Info (If Assigned) */}
                                 {pedido.entregador && (
                                     <div className="flex items-center gap-2 text-purple-700 text-xs bg-purple-50 p-2 rounded mt-2 border border-purple-100">
                                         <Bike size={14} className="shrink-0" />
                                         <div className="min-w-0">
                                            <p className="font-bold truncate" title={pedido.entregador.nome}>Motoboy: {pedido.entregador.nome}</p>
                                            {pedido.entregador.telefone && <p className="text-gray-500 truncate">{pedido.entregador.telefone}</p>}
                                         </div>
                                     </div>
                                 )}

                                 {!pedido.isRetirada && pedido.enderecoDeEntrega && (
                                     <div className="flex items-start gap-2 text-xs text-gray-600 border-t pt-2 mt-2">
                                         <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                                         <p className="line-clamp-2">
                                             {pedido.enderecoDeEntrega.logradouro}, {pedido.enderecoDeEntrega.numero}
                                             {pedido.enderecoDeEntrega.complemento && ` - ${pedido.enderecoDeEntrega.complemento}`}
                                             <br />
                                             {pedido.enderecoDeEntrega.bairro}
                                         </p>
                                     </div>
                                 )}
                             </div>
 
                             {/* Valor Total */}
                             <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 mb-2">
                                 <span className="text-gray-600 font-medium text-sm">Total:</span>
                                 <span className="text-gray-900 font-bold text-lg">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((pedido.valorTotal ?? 0) / 100)}
                                 </span>
                             </div>
 
                             {/* Itens */}
                             <div className="border-t pt-2 space-y-2">
                                 {pedido.sacola.map((item, idx) => (
                                     <div key={idx} className="flex gap-2 text-sm items-start group">
                                         <span className="font-bold text-gray-700 w-5 text-right mt-0.5 shrink-0">{item.quantidade}x</span>
                                         <div className="flex-1 min-w-0">
                                             <div className="flex justify-between items-start gap-1">
                                                 <p className="text-gray-800 leading-tight font-medium wrap-break-word">
                                                     {item.nomeProduto || item.produtoLoja?.produto?.nome || item.produtoLoja?.descricao || "Produto sem nome"}
                                                 </p>
                                                 
                                                  <button 
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         const nextStatus = (!item.status || item.status === PedidoStatus.Pendente) ? PedidoStatus.Preparando 
                                                             : item.status === PedidoStatus.Preparando ? PedidoStatus.Pronto 
                                                             : item.status === PedidoStatus.Pronto ? PedidoStatus.Entregue 
                                                             : PedidoStatus.Pendente;
                                                         updateItemStatus(item.id, nextStatus);
                                                     }}
                                                     className={`
                                                         ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border transition-colors whitespace-nowrap
                                                         ${!item.status || item.status === PedidoStatus.Pendente ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' : ''}
                                                         ${item.status === PedidoStatus.Preparando ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : ''}
                                                         ${item.status === PedidoStatus.Pronto ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : ''}
                                                         ${item.status === PedidoStatus.Entregue ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : ''}
                                                         ${item.status === PedidoStatus.SaiuParaEntrega ? 'bg-purple-100 text-purple-800 border-purple-300' : ''}
                                                         ${item.status === PedidoStatus.Cancelado ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                     `}
                                                     title="Alterar status do item"
                                                   >
                                                       <span className="flex items-center gap-1">
                                                         {(!item.status || item.status === PedidoStatus.Pendente) && <Clock size={10} />}
                                                         {item.status === PedidoStatus.Preparando && <ChefHat size={10} />}
                                                         {item.status === PedidoStatus.Pronto && <CheckCircle size={10} />}
                                                         {(item.status === PedidoStatus.Entregue || item.status === PedidoStatus.SaiuParaEntrega) && <UtensilsCrossed size={10} />}
                                                         {item.status || PedidoStatus.Pendente}
                                                       </span>
                                                   </button>
                                             </div>
                                             {item.observacao && <p className="text-xs text-red-500 italic">Obs: {item.observacao}</p>}
                                             {item.adicionais && item.adicionais.length > 0 && (<p className="text-xs text-gray-500">+ Adicionais...</p>)}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             
                             {pedido.observacao && (
                                 <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100 italic">" {pedido.observacao} "</div>
                             )}
                         </div>

                         {/* Card Actions */}
                         <div className="p-3 border-t bg-gray-50 rounded-b-xl flex flex-col gap-2 shrink-0">
                             <div className="flex gap-2 flex-wrap">
                                 <select 
                                     value={pedido.status || PedidoStatus.Pendente}
                                     onChange={(e) => updateStatus(pedido.id, e.target.value)}
                                     className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2 flex-1 outline-none font-medium shadow-sm"
                                     title="Alterar status manualmente"
                                 >
                                     <option value={PedidoStatus.AguardandoAceitacao}>Aguardando Aceitação</option>
                                     <option value={PedidoStatus.Pendente}>Pendente</option>
                                     <option value={PedidoStatus.EmPreparo}>Em Preparo</option>
                                     <option value={PedidoStatus.Pronto}>Pronto</option>
                                     <option value={PedidoStatus.SaiuParaEntrega}>Saiu para Entrega</option>
                                     <option value={PedidoStatus.Entregue}>Entregue</option>
                                     <option value={PedidoStatus.Concluido}>Concluído</option>
                                     <option value={PedidoStatus.Cancelado}>Cancelado</option>
                                 </select>

                                 {(pedido.status === PedidoStatus.AguardandoAceitacao || pedido.status === PedidoStatus.Pendente) && (
                                     <button onClick={() => updateStatus(pedido.id, PedidoStatus.EmPreparo)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm">Aceitar & Preparar</button>
                                 )}
                                 {pedido.status === PedidoStatus.EmPreparo && (
                                     <button onClick={() => updateStatus(pedido.id, PedidoStatus.Pronto)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-colors shadow-sm">Marcar como Pronto</button>
                                 )}
                                 {pedido.status === PedidoStatus.Pronto && (
                                     <button 
                                         onClick={() => {
                                             if (pedido.isRetirada || (pedido.numeroMesa && pedido.numeroMesa > 0)) {
                                                 updateStatus(pedido.id, PedidoStatus.Entregue);
                                             } else {
                                                 handleOpenDispatchModal(pedido);
                                             }
                                         }}
                                         className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold text-xs hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-1"
                                     >
                                         {(pedido.isRetirada || (pedido.numeroMesa && pedido.numeroMesa > 0)) ? 'Entregue na Mesa/Balcão' : <><Bike size={14}/> Despachar</>}
                                     </button>
                                 )}
                                 {pedido.status === PedidoStatus.SaiuParaEntrega && (
                                     <button onClick={() => updateStatus(pedido.id, PedidoStatus.Entregue)} className="flex-1 bg-green-700 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-800 transition-colors shadow-sm">Confirmar Entrega</button>
                                 )}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
          )}
      </div>
      
      {/* Dispatch Modal */}
      {showDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-[90%] md:max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Bike className="text-brand-primary" />
                          Selecionar Entregador
                      </h2>
                      <button onClick={() => setShowDispatchModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <p className="text-sm text-gray-500 mb-4">Escolha um funcionário disponível para levar o pedido #{selectedPedido?.id}.</p>
                      
                      {loadingMotoboys ? (
                          <div className="text-center py-8 text-gray-400">Carregando entregadores...</div>
                      ) : motoboys.length === 0 ? (
                          <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
                              Nenhum entregador disponível/ativo encontrado.
                          </div>
                      ) : (
                          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                              {motoboys.map(motoboy => (
                                  <button
                                      key={motoboy.id}
                                      onClick={() => handleDispatch(motoboy.id)}
                                      className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group"
                                  >
                                      <div className="min-w-0 pr-2">
                                          <p className="font-bold text-gray-800 truncate" title={motoboy.nome}>{motoboy.nome}</p>
                                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                              {motoboy.cargo && <span className="bg-gray-100 px-1 rounded font-medium">{motoboy.cargo}</span>}
                                              {motoboy.telefone ? <><Phone size={10} className="shrink-0"/> {motoboy.telefone}</> : 'Sem telefone'}
                                          </p>
                                      </div>
                                      <div className="opacity-0 group-hover:opacity-100 text-brand-primary shrink-0">
                                          <CheckCircle size={20} />
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
