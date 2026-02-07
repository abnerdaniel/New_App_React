
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import Link
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import type { Loja, Categoria } from '../types';
import { lojaService } from '../services/loja.service';

import { ProductModal } from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import type { Produto } from '../types';

export function LojaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [cardapio, setCardapio] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cart Context
  const { addItem, total, count } = useCart();

  useEffect(() => {
    if (id) {
      Promise.all([
        lojaService.getById(id),
        lojaService.getCardapio(id)
      ]).then(([lojaData, cardapioData]) => {
        setLoja(lojaData || null);
        setCardapio(cardapioData);
        setLoading(false);
      });
    }
  }, [id]);

  const handleProductClick = (produto: Produto) => {
    setSelectedProduct(produto);
    setIsModalOpen(true);
  };

  const handleAddToCart = (produto: Produto, quantidade: number, observacao: string, extras: Produto[]) => {
    addItem(produto, quantidade, observacao, extras);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!loja) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loja não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Imagem */}
      <div className="h-48 md:h-64 relative bg-gray-200">
        <img 
          src={loja.bannerUrl || loja.imagemUrl} 
          alt={loja.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Link to="/" className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center">
             <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Info da Loja */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{loja.nome}</h1>
              <p className="text-gray-500 text-sm mt-1">{loja.categoria} • {loja.descricao}</p>
            </div>
            <div className="flex flex-col items-end">
                 {loja.avaliacao !== undefined && (
                    <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{loja.avaliacao}</span>
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 border-t pt-4 border-gray-100">
            <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{loja.tempoEntregaMin}-{loja.tempoEntregaMax} min</span>
            </div>
            <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>2.4 km (Entrega R$ {loja.taxaEntrega.toFixed(2)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cardápio */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {cardapio.map(categoria => (
            <div key={categoria.id} id={categoria.id} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{categoria.nome}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Produtos */}
                    {categoria.produtos.map(produto => (
                        <div 
                            key={`prod-${produto.id}`} 
                            className="bg-white border border-gray-100 rounded-lg p-3 flex gap-4 hover:border-gray-200 transition-colors cursor-pointer shadow-sm active:scale-[0.99] duration-100"
                            onClick={() => handleProductClick(produto)}
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-2">{produto.descricao}</p>
                                <span className="text-green-700 font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                </span>
                            </div>
                            {produto.imagemUrl && (
                                <img 
                                    src={produto.imagemUrl} 
                                    alt={produto.nome} 
                                    className="w-24 h-24 object-cover rounded-md bg-gray-100"
                                />
                            )}
                        </div>
                    ))}

                    {/* Combos */}
                    {categoria.combos && categoria.combos.map(combo => (
                        <div 
                            key={`combo-${combo.id}`} 
                            className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-4 hover:border-orange-200 transition-colors cursor-pointer shadow-sm active:scale-[0.99] duration-100"
                            // onClick={() => handleComboClick(combo)} // TODO: Add logic for Combo click/modal
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{combo.nome}</h3>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-2">{combo.descricao}</p>
                                
                                {/* Lista de Itens do Combo */}
                                {combo.itens && combo.itens.length > 0 && (
                                    <ul className="mb-2 space-y-1">
                                        {combo.itens.map(item => (
                                            <li key={item.id} className="text-xs text-gray-600 flex items-center gap-1">
                                                <span className="font-medium text-gray-800">{item.quantidade}x</span>
                                                <span>{item.nomeProduto}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <span className="text-green-700 font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(combo.preco)}
                                </span>
                            </div>
                            {combo.imagemUrl && (
                                <img 
                                    src={combo.imagemUrl} 
                                    alt={combo.nome} 
                                    className="w-24 h-24 object-cover rounded-md bg-gray-100"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        produto={selectedProduct}
        onAddToCart={handleAddToCart}
      />

        {count > 0 && (
            <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto">
                <div 
                    onClick={() => navigate('/carrinho')}
                    className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center cursor-pointer hover:bg-red-700 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{count}</div>
                        <span className="font-medium">Ver Sacola</span>
                    </div>
                    <span className="font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </span>
                </div>
            </div>
        )}
    </div>
  );
}
