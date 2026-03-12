import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiter } from '../../contexts/WaiterContext';
import { listarPedidosFila, atualizarStatusItem, type PedidoFila } from '../../services/cozinha';
import { ChefHat, ShoppingBag, Clock, LogOut, RefreshCw } from 'lucide-react';

export function CozinhaPage() {
    const { waiterUser, waiterLojaId, logout } = useWaiter();
    const [pedidos, setPedidos] = useState<PedidoFila[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchPedidos = useCallback(async () => {
        if (!waiterLojaId) return;
        try {
            setLoading(true);
            const data = await listarPedidosFila(waiterLojaId);
            setPedidos(data);
        } catch (error) {
            console.error('Erro ao buscar pedidos', error);
        } finally {
            setLoading(false);
        }
    }, [waiterLojaId]);

    useEffect(() => {
        if (waiterUser) {
            fetchPedidos();
            const interval = setInterval(fetchPedidos, 10000);
            return () => clearInterval(interval);
        }
    }, [waiterUser, fetchPedidos]);

    const handleStatusItem = async (itemId: number, currentStatus: string | undefined) => {
        const next = !currentStatus || currentStatus === 'Pendente' ? 'Preparando' 
                   : currentStatus === 'Preparando' ? 'Pronto' 
                   : currentStatus === 'Pronto' ? 'Entregue'
                   : 'Pendente';
        
        try {
            // Optimistic update
            setPedidos(prev => prev.map(p => ({
                ...p,
                sacola: p.sacola.map(item => item.id === itemId ? { ...item, status: next } : item)
            })));
            
            await atualizarStatusItem(itemId, next);
            fetchPedidos();
        } catch (error) {
            console.error('Erro ao atualizar status', error);
            // Revert? Simply refetch
            fetchPedidos();
        }
    };

    const getWaitTime = (dataVenda: string) => {
        const start = new Date(dataVenda).getTime();
        const now = new Date().getTime();
        return Math.floor((now - start) / 60000);
    };

    if (!waiterUser) {
        // Redirect to unified login
        setTimeout(() => window.location.href = '/login-funcionario', 0); // Using location.href to ensure full reset/redirect or navigate if inside router
        // Since we are inside router:
        // navigate('/login-funcionario');
        // but hook needs to be top level.
        return <RedirectToLogin />;
    }

    const localOrders = pedidos.filter(p => !!p.numeroMesa); // Has table number
    const deliveryOrders = pedidos.filter(p => !p.numeroMesa); // No table number

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <ChefHat size={24} className="text-red-600" />
                    </div>
                    <div>
                         <h1 className="text-xl font-bold text-gray-800">Cozinha</h1>
                         <p className="text-xs text-gray-500">Fila de Produção</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={fetchPedidos} className="p-2 hover:bg-gray-100 rounded-full" title="Atualizar">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                     </button>
                     <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
                        <LogOut size={20} /> <span className="hidden md:inline">Sair</span>
                     </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start overflow-hidden h-[calc(100vh-80px)]">
                
                {/* Local / Mesas Column */}
                <div className="flex flex-col h-full bg-white/50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="bg-white border-b p-4 flex justify-between items-center sticky top-0">
                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                             <span className="w-3 h-3 rounded-full bg-green-500"></span>
                             Salão / Mesas
                        </h2>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-bold">{localOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {localOrders.map(pedido => (
                            <OrderCard key={pedido.id} pedido={pedido} onStatusItem={handleStatusItem} getWaitTime={getWaitTime} type="local" />
                        ))}
                        {localOrders.length === 0 && <EmptyState message="Nenhum pedido de mesa" />}
                    </div>
                </div>

                {/* Delivery Column */}
                <div className="flex flex-col h-full bg-white/50 rounded-xl overflow-hidden border border-gray-200">
                    <div className="bg-white border-b p-4 flex justify-between items-center sticky top-0">
                         <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                             <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                             Delivery
                        </h2>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-bold">{deliveryOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {deliveryOrders.map(pedido => (
                            <OrderCard key={pedido.id} pedido={pedido} onStatusItem={handleStatusItem} getWaitTime={getWaitTime} type="delivery" />
                        ))}
                        {deliveryOrders.length === 0 && <EmptyState message="Nenhum pedido delivery" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderCard({ pedido, onStatusItem, getWaitTime, type }: { 
    pedido: PedidoFila, 
    onStatusItem: (id: number, status?: string) => void,
    getWaitTime: (d: string) => number,
    type: 'local' | 'delivery'
}) {
    const min = getWaitTime(pedido.dataVenda);
    const isLate = min > 30;

    return (
        <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${isLate ? 'border-red-500' : type === 'local' ? 'border-green-500' : 'border-blue-500'}`}>
            <div className="flex justify-between items-start mb-3 border-b pb-2">
                 <div>
                     <h3 className="font-bold text-lg text-gray-800">
                        {type === 'local' ? `Mesa ${pedido.numeroMesa}` : `Pedido #${pedido.id}`}
                     </h3>
                     <p className="text-sm text-gray-500">
                        {pedido.cliente?.nome || pedido.clienteNomeTemporario || 'Cliente não identificado'}
                     </p>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isLate ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                        <Clock size={12} /> {min} min
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(pedido.dataVenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                 </div>
            </div>

            <div className="space-y-2">
                {pedido.sacola.map(item => {
                    const itemName = item.comboId ? 
                        (item.combo?.nome || item.nomeProduto || 'Combo') : 
                        (item.nomeProduto || item.produtoLoja?.produto?.nome || 'Item');
                    
                    const itemStatus = item.status || 'Pendente';
                    const hasSubItems = item.subItens && item.subItens.length > 0;
                    
                    return (
                        <div key={item.id} className="flex flex-col group border-b border-gray-100 last:border-0 pb-2 mb-2 last:mb-0 last:pb-0">
                            {/* ITEM PRINCIPAL (Produto ou Cabeçalho do Combo) */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <span className="font-bold mr-2">{item.quantidade}x</span>
                                    <span className={itemStatus === 'Entregue' && !hasSubItems ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}>
                                        {itemName}
                                    </span>
                                    {(item.produtoLoja?.produto?.descricao || item.produtoLoja?.descricao) && (
                                        <div className="text-xs text-gray-500 mt-0.5 ml-6 italic">
                                            Ingredientes: {item.produtoLoja?.produto?.descricao || item.produtoLoja?.descricao}
                                        </div>
                                    )}
                                    {item.observacao && (
                                        <div className="text-xs text-red-500 font-medium mt-0.5 ml-6">Obs: {item.observacao}</div>
                                    )}
                                </div>
                                
                                {/* Botão de Status Apenas se NÃO for Combo (pois combos usam subitens) */}
                                {!hasSubItems && (
                                    <button 
                                        onClick={() => onStatusItem(item.id, item.status)}
                                        className={`
                                            px-2 py-1 rounded text-xs font-bold uppercase transition-colors min-w-[80px] text-center
                                            ${itemStatus === 'Pendente' || itemStatus === 'Aguardando Aceitação' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
                                            ${itemStatus === 'Preparando' || itemStatus === 'Em Preparo' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                                            ${itemStatus === 'Pronto' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                            ${itemStatus === 'Entregue' || itemStatus === 'Saiu para Entrega' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                        `}
                                    >
                                        {itemStatus === 'Aguardando Aceitação' ? 'Pendente' : itemStatus === 'Em Preparo' ? 'Preparando' : itemStatus}
                                    </button>
                                )}
                            </div>

                            {/* ADICIONAIS DO ITEM */}
                            {item.adicionais && item.adicionais.length > 0 && (
                                <div className="ml-6 mt-1 text-xs text-gray-500">
                                    <span className="font-semibold text-gray-600">Adicionais:</span>
                                    {item.adicionais.map(add => (
                                        <div key={add.id} className="ml-2 flex items-center gap-1">
                                            <span>+</span>
                                            <span>{add.quantidade || item.quantidade}x</span>
                                            <span>{add.produtoLoja?.produto?.nome || add.produtoLoja?.descricao || 'Adicional'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SUB-ITENS DO COMBO (Com botões de status individuais) */}
                            {hasSubItems && (
                                <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                                    {item.subItens!.map(sub => {
                                         const subStatus = sub.status || 'Pendente';
                                         return (
                                             <div key={sub.id} className="flex items-center justify-between">
                                                 <div className="flex-1 text-sm flex flex-col justify-center">
                                                     <div>
                                                         <span className="font-medium mr-1">{sub.quantidade}x</span>
                                                         <span className={subStatus === 'Entregue' ? 'text-gray-400 line-through' : 'text-gray-700'}>
                                                            {sub.nomeProduto || 'Item do Combo'}
                                                         </span>
                                                     </div>
                                                     {(sub.produtoLoja?.produto?.descricao || sub.produtoLoja?.descricao) && (
                                                         <div className="text-[10px] text-gray-400 italic mt-0.5 ml-4">
                                                             Ingredientes: {sub.produtoLoja?.produto?.descricao || sub.produtoLoja?.descricao}
                                                         </div>
                                                     )}
                                                 </div>
                                                 <button 
                                                    onClick={() => onStatusItem(sub.id, sub.status)}
                                                    className={`
                                                        px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors min-w-[70px] text-center
                                                        ${subStatus === 'Pendente' || subStatus === 'Aguardando Aceitação' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
                                                        ${subStatus === 'Preparando' || subStatus === 'Em Preparo' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                                                        ${subStatus === 'Pronto' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                        ${subStatus === 'Entregue' || subStatus === 'Saiu para Entrega' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                                    `}
                                                 >
                                                     {subStatus === 'Aguardando Aceitação' ? 'Pendente' : subStatus === 'Em Preparo' ? 'Preparando' : subStatus}
                                                 </button>
                                             </div>
                                         );
                                    })}
                                </div>
                            )}
                            
                            {/* FALLBACK LEGACY COMBO (Pedidos velhos sem sub-itens registrados no banco) */}
                            {!hasSubItems && item.combo && item.combo.itens && (
                                <div className="ml-6 mt-1 text-xs text-gray-500 italic">
                                    {item.combo.itens.map(ci => (
                                        <div key={ci.id}>• {ci.produtoLoja?.produto?.nome}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {pedido.observacao && (
                <div className="mt-3 text-sm bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200">
                     <strong>Obs:</strong> {pedido.observacao}
                </div>
            )}
        </div>
    );
}

function RedirectToLogin() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/login-funcionario');
    }, [navigate]);
    return null;
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <ShoppingBag size={32} className="mb-2 opacity-50" />
            <p>{message}</p>
        </div>
    );
}
