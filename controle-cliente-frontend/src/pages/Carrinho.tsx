import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';

export function CartPage() {
  const { items, removeItem, updateQuantity, total, count, clearCart } = useCart();
  const { isAuthenticated } = useClientAuth();
  const navigate = useNavigate();

  const handleFinalizar = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/identificacao', { state: { from: { pathname: '/checkout' } } });
    }
  };

  /* API URL setup */
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024'; 
  // Should ideally be in a config file

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sua sacola está vazia</h1>
        <p className="text-gray-500 mb-8">Adicione itens deliciosos para começar.</p>
        <Link to="/" className="text-red-600 font-semibold hover:text-red-700">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Sua Sacola ({count})</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100 mb-6">
          {items.map(item => (
            <div key={item.produto.id} className="p-4 flex gap-4">
               {item.produto.imagemUrl && (
                  <img 
                    src={item.produto.imagemUrl} 
                    alt={item.produto.nome} 
                    className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                  />
                )}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.produto.nome}</h3>
                        <span className="font-medium text-gray-900 whitespace-nowrap ml-2">
                             {/* Calculo considerando extras */}
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                               (item.produto.preco + (item.extras?.reduce((acc, e) => acc + e.preco, 0) || 0)) * item.quantidade
                             )}
                        </span>
                    </div>

                    {/* Extras */}
                    {item.extras && item.extras.length > 0 && (
                        <div className="text-xs text-gray-500 mb-2">
                            {item.extras.map(e => (
                                <span key={e.id} className="block">+ {e.nome}</span>
                            ))}
                        </div>
                    )}

                    {item.observacao && (
                        <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded line-clamp-2">
                            Obs: {item.observacao}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                         <div className="flex items-center border border-gray-200 rounded-lg">
                            <button 
                                onClick={() => updateQuantity(item.produto.id, item.quantidade - 1)}
                                className="p-1 px-3 text-red-600 hover:bg-red-50 rounded-l-lg transition-colors"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold text-gray-900 w-6 text-center">{item.quantidade}</span>
                            <button 
                                onClick={() => updateQuantity(item.produto.id, item.quantidade + 1)}
                                className="p-1 px-3 text-red-600 hover:bg-red-50 rounded-r-lg transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <button 
                            onClick={() => removeItem(item.produto.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-24">
            <div className="flex justify-between items-center text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600 mb-4">
                <span>Taxa de Entrega</span>
                <span className="text-green-600">A calcular</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto">
            <button 
                onClick={handleFinalizar}
                className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100 active:scale-[0.99] duration-100"
            >
                Finalizar Pedido
            </button>
        </div>
      </div>
    </div>
  );
}
