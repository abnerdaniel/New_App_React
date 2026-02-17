
import { useState } from 'react';
import { ShoppingBag, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export function MiniCartWidget() {
    const { total, count, items, removeItem } = useCart();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    if (count === 0) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ${isExpanded ? 'h-[80vh] rounded-t-2xl' : 'h-20 rounded-t-xl'}`}>
            {/* Header / Toggle Area */}
            <div 
                className="h-20 px-4 flex items-center justify-between cursor-pointer border-b border-gray-100"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md">
                        {count}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">Meu Pedido</p>
                        <p className="font-bold text-red-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium hidden sm:block">
                        {isExpanded ? 'Minimizar' : 'Ver Detalhes'}
                    </span>
                    <div className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="flex flex-col h-[calc(100%-5rem)]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {items.map(item => (
                            <div key={`${item.produto.id}-${JSON.stringify(item.observacao)}`} className="flex justify-between items-start border-b border-gray-50 pb-4">
                                <div className="flex gap-3">
                                    <span className="font-bold text-gray-500 text-sm mt-0.5">{item.quantidade}x</span>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.produto.nome}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2">{item.produto.descricao}</p>
                                        {item.observacao && (
                                            <p className="text-[10px] text-gray-400 mt-1 italic bg-gray-50 p-1 rounded">
                                                Obs: {item.observacao}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-medium text-gray-700 text-sm">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((item.produto.preco * item.quantidade))}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeItem(item.produto.id); }}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate('/carrinho'); }}
                            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={18} />
                            Finalizar Pedido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
