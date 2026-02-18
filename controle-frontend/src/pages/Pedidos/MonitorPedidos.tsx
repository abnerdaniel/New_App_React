import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/axios';
import { Clock, User, CheckCircle, Truck, UtensilsCrossed, AlertCircle, ChefHat, MapPin } from 'lucide-react';

interface PedidoMonitor {
  id: number;
  clienteId?: number;
  cliente?: {
    nome: string;
    telefone: string;
  };
  funcionarioId?: number;
  funcionario?: {
    nome: string;
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

export function MonitorPedidos() {
  const { activeLoja } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'todos' | 'delivery' | 'local'>('todos');

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

  const filteredPedidos = pedidos.filter(p => {
    // Check if it's a "Local" order (Retirada OR has Mesa)
    // FIX: If it has an address, it is Delivery, even if isRetirada is true (legacy bug workaround)
    // UNLESS it is also a Mesa order (Mesa logic overrides everything)
    
    const isMesa = (p.numeroMesa && p.numeroMesa > 0);
    const hasAddress = p.enderecoDeEntrega && (p.enderecoDeEntrega.logradouro || p.enderecoDeEntrega.bairro);
    
    // Explicit Logic:
    // Mesa = Local
    // Address & !Mesa = Delivery (ignore isRetirada flag if address implies delivery)
    // No Address & !Mesa = Retirada (Local)
    
    let isDelivery = false;
    let isLocal = false;

    if (isMesa) {
        isLocal = true;
    } else if (hasAddress) {
        isDelivery = true;
    } else {
        // Fallback to isRetirada flag logic, or default to Local if no address
        isLocal = true; 
    }
    
    // Override if user explicitly wants filters
    if (filterType === 'delivery') return isDelivery;
    if (filterType === 'local') return isLocal;
    return true;
  });

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Pendente': // Treat as Waiting Acceptance
          case 'Aguardando Aceitação': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'Em Preparo': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Pronto': return 'bg-green-100 text-green-800 border-green-200';
          case 'Saiu para Entrega':
          case 'Entregue': 
            return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'Concluido': return 'bg-gray-100 text-gray-800 border-gray-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  const getTempoDecorrido = (data: string) => {
      const diff = new Date().getTime() - new Date(data).getTime();
      const mins = Math.floor(diff / 60000);
      return `${mins} min`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <UtensilsCrossed className="text-brand-primary" />
                Monitor de Pedidos
            </h1>
            <p className="text-sm text-gray-500">Gerencie a fila de produção da cozinha e entregas</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setFilterType('todos')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'todos' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Todos ({pedidos.length})
              </button>
              <button 
                onClick={() => setFilterType('local')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'local' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Local / Mesa
              </button>
              <button 
                onClick={() => setFilterType('delivery')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterType === 'delivery' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Delivery
              </button>
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
                 <p className="text-lg font-medium">Nenhum pedido na fila no momento.</p>
             </div>
          ) : (
            <div className="flex gap-4 h-full pb- safe">
                {/* Columns by Status could be better, but user asked for list separated by type.
                    Since we filter by type in header, let's just list cards in a grid or masonry. 
                    Grid is safer for responsiveness.
                */}
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
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs font-bold opacity-80">
                                        <Clock size={12} />
                                        {getTempoDecorrido(pedido.dataVenda)}
                                    </div>
                                    <div className="text-xs opacity-70 mt-0.5">
                                        {new Date(pedido.dataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                                            <div>
                                                <p className="font-bold">{pedido.cliente.nome}</p>
                                                <p className="text-xs text-gray-500">{pedido.cliente.telefone}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User size={16} className="text-brand-primary" />
                                            <span className="font-bold">{pedido.descricao || "Cliente não identificado"}</span>
                                        </div>
                                    )}

                                    {pedido.funcionario && (
                                        <div className="flex items-center gap-2 text-gray-600 text-xs bg-gray-50 p-1.5 rounded">
                                            <span className="font-bold text-gray-500">Atendente:</span>
                                            {pedido.funcionario.nome}
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

                                {/* Itens */}
                                <div className="border-t pt-2 space-y-2">
                                    {pedido.sacola.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 text-sm items-start group">
                                            <span className="font-bold text-gray-700 w-5 text-right mt-0.5">{item.quantidade}x</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-gray-800 leading-tight font-medium">
                                                        {item.nomeProduto || item.produtoLoja?.produto?.nome || item.produtoLoja?.descricao || "Produto sem nome"}
                                                    </p>
                                                    
                                                    {/* Item Status Button */}
                                                     <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const nextStatus = (!item.status || item.status === 'Pendente') ? 'Em Preparo' 
                                                                : item.status === 'Em Preparo' ? 'Pronto' 
                                                                : item.status === 'Pronto' ? 'Entregue' 
                                                                : 'Pendente';
                                                            updateItemStatus(item.id, nextStatus);
                                                        }}
                                                        className={`
                                                            ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border transition-colors whitespace-nowrap
                                                            ${!item.status || item.status === 'Pendente' ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' : ''}
                                                            ${item.status === 'Em Preparo' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : ''}
                                                            ${item.status === 'Pronto' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : ''}
                                                            ${item.status === 'Entregue' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : ''}
                                                            ${item.status === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                        `}
                                                        title="Alterar status do item"
                                                      >
                                                          {/* Icon based on status */}
                                                          <span className="flex items-center gap-1">
                                                            {(!item.status || item.status === 'Pendente') && <Clock size={10} />}
                                                            {item.status === 'Em Preparo' && <ChefHat size={10} />}
                                                            {item.status === 'Pronto' && <CheckCircle size={10} />}
                                                            {item.status === 'Entregue' && <UtensilsCrossed size={10} />}
                                                            {item.status || 'Pendente'}
                                                          </span>
                                                      </button>
                                                </div>

                                                {item.observacao && <p className="text-xs text-red-500 italic">Obs: {item.observacao}</p>}
                                                {item.adicionais && item.adicionais.length > 0 && (
                                                    <p className="text-xs text-gray-500">+ Adicionais...</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {pedido.observacao && (
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100 italic">
                                        " {pedido.observacao} "
                                    </div>
                                )}
                            </div>

                            {/* Card Actions */}
                            <div className="p-3 border-t bg-gray-50 rounded-b-xl flex gap-2">
                                {(pedido.status === 'Aguardando Aceitação' || pedido.status === 'Pendente') && (
                                    <button 
                                        onClick={() => updateStatus(pedido.id, 'Em Preparo')}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Aceitar & Preparar
                                    </button>
                                )}
                                {pedido.status === 'Em Preparo' && (
                                    <button 
                                        onClick={() => updateStatus(pedido.id, 'Pronto')}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        Marcar como Pronto
                                    </button>
                                )}
                                {pedido.status === 'Pronto' && (
                                    <button 
                                        onClick={() => updateStatus(pedido.id, (pedido.isRetirada || (pedido.numeroMesa && pedido.numeroMesa > 0)) ? 'Entregue' : 'Saiu para Entrega')}
                                        className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-sm"
                                    >
                                        {(pedido.isRetirada || (pedido.numeroMesa && pedido.numeroMesa > 0)) ? 'Entregue na Mesa/Balcão' : 'Despachar Entrega'}
                                    </button>
                                )}
                                {pedido.status === 'Saiu para Entrega' && (
                                    <button 
                                        onClick={() => updateStatus(pedido.id, 'Entregue')}
                                        className="flex-1 bg-green-700 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-800 transition-colors shadow-sm"
                                    >
                                        Confirmar Entrega
                                    </button>
                                )}
                                {/* Local Order: If status is 'Entregue', maybe show 'Concluir'? Or leave it to the Cashier/Mesa closing? 
                                    Kitchen usually doesn't "Conclude" (Pay). So 'Entregue' is their final state. 
                                    We can hide actions if Entregue for Local.
                                */}
                                {pedido.status === 'Entregue' && !pedido.isRetirada && !pedido.numeroMesa && (
                                     // Only show action if it was "Saiu para Entrega" -> Entregue (already handled above)
                                     // Actually Entregue is final for delivery too in this view.
                                     // So no button needed.
                                     null
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
      </div>
    </div>
  );
}
