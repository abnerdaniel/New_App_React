
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import Link
import { ArrowLeft, Star, Clock, MapPin, User, LogOut } from 'lucide-react';
import type { Loja, Categoria, Combo } from '../types';
import { lojaService } from '../services/loja.service';

import { ProductModal } from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';
import type { Produto } from '../types';

import { ComboModal } from '../components/ComboModal';

import { PedidosAtivosWidget } from '../components/PedidosAtivosWidget'; // New

import { ProductImage } from '../components/ProductImage';
import { useWaiter } from '../context/WaiterContext';

export function LojaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [cardapio, setCardapio] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combo Modal State
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);

  // Cart Context
  const { addItem, total, count } = useCart();
  const { isAuthenticated, cliente, logout } = useClientAuth();
  const { isWaiterMode, mesaSelecionada, sairModoGarcom } = useWaiter();

  useEffect(() => {
    if (id) {
      Promise.all([
        lojaService.getById(id),
        lojaService.getCardapio(id)
      ]).then(([lojaData, cardapioData]) => {
        setLoja(lojaData || null);
        setCardapio(cardapioData);
        if (lojaData) {
            document.title = lojaData.nome;
            localStorage.setItem('lojaId', lojaData.id); // Persist store ID
            
            // Persist store Slug
            const slug = lojaData.slug || lojaData.nome.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            localStorage.setItem('lojaSlug', slug);
        }
        setLoading(false);
      });
    }
    
    return () => {
        document.title = 'Delivery App';
    };
  }, [id]);

  const handleProductClick = (produto: Produto) => {
    setSelectedProduct(produto);
    setIsModalOpen(true);
  };

  const handleComboClick = (combo: Combo) => {
      setSelectedCombo(combo);
      setIsComboModalOpen(true);
  }

  const handleAddToCart = (produto: Produto, quantidade: number, observacao: string, extras: Produto[]) => {
    addItem(produto, quantidade, observacao, extras);
    setIsModalOpen(false);
  };

  const handleAddComboToCart = (combo: Combo, quantidade: number, extrasMap: { [itemId: number]: Produto[] }, observacao: string) => {
      // Calculando preço total dos extras
      const totalExtras = Object.values(extrasMap).flat().reduce((acc, e) => acc + e.preco, 0);
      
      // Cria uma descrição detalhada do combo
      const detalheItens = combo.itens.map((item) => {
          // Extraindo extras para este item (usando type assertion se necessário ou assumindo que extrasMap usa number)
          // O ComboModal passa extrasMap com chaves numéricas (IDs dos itens)
          const itemExtras = extrasMap[Number(item.id)] || [];
          const extraText = itemExtras.length > 0 ? ` (+ ${itemExtras.map(e => e.nome).join(', ')})` : '';
          return `${item.quantidade}x ${item.nomeProduto}${extraText}`;
      }).join('\n');

      const fullObservacao = `[COMBO: ${combo.nome}]\n${detalheItens}${observacao ? `\nObs: ${observacao}` : ''}`;

      // Produto "fictício" representando o Combo no carrinho
      const produtoCombo: Produto = {
          id: `combo-${combo.id}-${Date.now()}`, 
          nome: `Combo: ${combo.nome}`,
          descricao: combo.descricao,
          preco: combo.preco + totalExtras, 
          imagemUrl: combo.imagemUrl,
          categoriaId: combo.categoriaId?.toString() || '', 
          lojaId: loja?.id || '',
          adicionais: [], 
          isAdicional: false
      };

      // Adiciona ao carrinho
      addItem(produtoCombo, quantidade, fullObservacao, []);
      setIsComboModalOpen(false);
  }

  // Determine if store is closed
  const isLojaFechada = loja ? !loja.aberto : false;

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
          src={loja.capaUrl || loja.bannerUrl || loja.imagemUrl} 
          alt={loja.nome}
          className={`w-full h-full object-cover ${isLojaFechada ? 'grayscale' : ''}`}
        />
        
        {/* Waiter Mode Header Overlay */}
        {isWaiterMode && mesaSelecionada && (
            <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-3 z-30 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Mesa {mesaSelecionada.numero}</span>
                    <span className="text-sm opacity-90 border-l border-blue-400 pl-2 ml-2">
                        {mesaSelecionada.clienteNome || mesaSelecionada.nome || 'Cliente'}
                    </span>
                </div>
                <button 
                    onClick={() => {
                        if(confirm('Sair da mesa? O carrinho será limpo.')) {
                            // Limpar carrinho? Talvez.
                            // clearCart(); 
                            sairModoGarcom();
                            navigate('/garcom');
                        }
                    }}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                    Sair
                </button>
            </div>
        )}

        <div className="absolute top-20 left-4"> { /* Adjusted top position if Waiter Mode */ }
          <Link to={isWaiterMode ? '/garcom' : '/'} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center">
             <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-20">
            {!isAuthenticated ? (
                <Link to="/identificacao" className="bg-white/90 p-2 px-4 rounded-full shadow-lg hover:bg-white transition-colors flex items-center gap-2 text-gray-800 font-medium text-sm">
                    <User className="w-5 h-5" />
                    Entrar
                </Link> 
            ) : (
                <div className="flex items-center gap-2">
                     <Link to="/meus-pedidos" className="bg-white/90 p-2 px-3 rounded-full shadow-lg flex items-center gap-2 text-gray-800 font-medium text-sm hover:bg-gray-50 transition-colors">
                        <User className="w-5 h-5 text-red-600" />
                        <span>Olá, {cliente?.nome.split(' ')[0]}</span>
                    </Link>
                     <button 
                        onClick={logout}
                        className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Sair"
                     >
                        <LogOut className="w-5 h-5" />
                     </button>
                </div>
            )}
         </div>
        
        {isLojaFechada && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-xl transform -rotate-2 border-2 border-white/20">
              LOJA FECHADA
            </div>
          </div>
        )}
      </div>

      {/* Info da Loja */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        {loja.aceitandoPedidos === false && (
            <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg mb-4 flex items-center justify-center gap-2 font-bold text-center border-2 border-white/20">
                <LogOut size={24} />
                <span>DESCULPE, NÃO ESTAMOS ACEITANDO PEDIDOS DELIVERY NO MOMENTO.</span>
            </div>
        )}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex gap-4 sm:gap-6">
            
            {/* Logo da Loja (Ao lado do nome) */}
            {loja.logoUrl && (
               <div className="shrink-0">
                  <img 
                    src={loja.logoUrl} 
                    alt={loja.nome} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-100 shadow-sm" 
                  />
               </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                    <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{loja.nome}</h1>
                    <p className="text-gray-500 text-sm mt-1">{loja.categoria} • {loja.descricao}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                        {loja.avaliacao !== undefined && (
                            <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{loja.avaliacao}</span>
                            </div>
                        )}
                        {isLojaFechada && (
                        <span className="mt-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 whitespace-nowrap">
                            Fechada
                        </span>
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
        </div>
      </div>

      {/* Cardápio */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {cardapio.map(categoria => (
            <div key={categoria.id} id={categoria.id} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{categoria.nome}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Produtos */}
                    {categoria.produtos.map(produto => {
                        const indisponivel = produto.disponivel === false;
                        return (
                            <div 
                                key={`prod-${produto.id}`} 
                                className={`bg-white border border-gray-100 rounded-lg p-3 flex gap-4 transition-colors shadow-sm duration-100 relative
                                    ${indisponivel ? 'opacity-60 grayscale cursor-not-allowed bg-gray-50' : 'hover:border-gray-200 cursor-pointer active:scale-[0.99]'}
                                `}
                                onClick={() => !indisponivel && handleProductClick(produto)}
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-2">{produto.descricao}</p>
                                    <span className="text-green-700 font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                    </span>
                                    {indisponivel && <span className="text-xs font-bold text-red-500 ml-2 border border-red-200 bg-red-50 px-1 rounded">Indisponível</span>}
                                </div>
                                    <ProductImage 
                                        src={produto.imagemUrl} 
                                        alt={produto.nome} 
                                        className="w-24 h-24 object-cover rounded-md bg-gray-100"
                                        productType={produto.tipo}
                                    />
                            </div>
                        );
                    })}

                    {/* Combos */}
                    {categoria.combos && categoria.combos.map(combo => {
                        const indisponivel = combo.ativo === false;
                        return (
                            <div 
                                key={`combo-${combo.id}`} 
                                className={`bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-4 transition-colors shadow-sm duration-100 relative
                                    ${indisponivel ? 'opacity-60 grayscale cursor-not-allowed bg-gray-50 border-gray-200' : 'hover:border-orange-200 cursor-pointer active:scale-[0.99]'}
                                `}
                                onClick={() => !indisponivel && handleComboClick(combo)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{combo.nome}</h3>
                                        {indisponivel && <span className="text-xs font-bold text-red-500 border border-red-200 bg-red-50 px-1 rounded">Indisponível</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-2">{combo.descricao}</p>
                                    
                                    {/* Lista de Itens do Combo */}
                                    {combo.itens && combo.itens.length > 0 && (
                                        <ul className="mb-2 space-y-1">
                                            {combo.itens.map((item) => (
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
                                    <ProductImage 
                                        src={combo.imagemUrl} 
                                        alt={combo.nome} 
                                        className="w-24 h-24 object-cover rounded-md bg-gray-100"
                                        isCombo={true}
                                    />
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        produto={selectedProduct}
        onAddToCart={handleAddToCart}
        isStoreClosed={isLojaFechada}
      />

      <ComboModal 
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        combo={selectedCombo}
        onAddToCart={handleAddComboToCart}
        isStoreClosed={isLojaFechada}
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
        <PedidosAtivosWidget />
    </div>
  );
}
