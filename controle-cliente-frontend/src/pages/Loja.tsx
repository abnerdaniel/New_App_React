
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { Star, Clock, MapPin, User, LogOut, Search, MessageCircle } from 'lucide-react';
import type { Loja, Categoria, Combo } from '../types';
import { lojaService } from '../services/loja.service';

import { ProductModal } from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';
import type { Produto, OpcaoItemCliente, ComboEtapaEscolha } from '../types';

import { ComboModal } from '../components/ComboModal';

import { PedidosAtivosWidget } from '../components/PedidosAtivosWidget'; // New

import { ProductImage } from '../components/ProductImage';

import { CategoryNav } from '../components/CategoryNav';
import { MiniCartWidget } from '../components/MiniCartWidget';

export function LojaPage() {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [cardapio, setCardapio] = useState<Categoria[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // New State
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combo Modal State
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);

  // Cart Context
  const { addItem } = useCart();
  const { isAuthenticated, cliente, logout } = useClientAuth();

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
            localStorage.setItem('lojaId', lojaData.id);
            
            const slug = lojaData.slug || lojaData.nome.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            localStorage.setItem('lojaSlug', slug);

            // Dynamic Favicon for Store
            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (link && lojaData.logoUrl) {
                 const img = new Image();
                 img.src = lojaData.logoUrl;
                 img.onload = () => { link.href = img.src; };
            }
        }
        setLoading(false);
      });
    }
    
    return () => {
        document.title = 'Controle Food';
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (link) {
            link.href = '/logo.png';
        }
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

  const handleAddToCart = (produto: Produto, quantidade: number, observacao: string, extras: Produto[], opcoesSelecionadas?: OpcaoItemCliente[]) => {
    addItem(produto, quantidade, observacao, extras, opcoesSelecionadas);
    setIsModalOpen(false);
  };

  const handleAddComboToCart = (combo: Combo, quantidade: number, extrasMap: { [itemId: number]: Produto[] }, observacao: string, etapasSelecionadas?: ComboEtapaEscolha[]) => {
      // Calculando preço total dos extras
      const totalExtras = Object.values(extrasMap).flat().reduce((acc, e) => acc + e.preco, 0);
      
      // Calculando preço das etapas iterando pelo combo de props
      let totalEtapas = 0;
      let textoEtapas = "";
      if (etapasSelecionadas && combo.etapas) {
          etapasSelecionadas.forEach(es => {
              const etapaBase = combo.etapas?.find(e => e.id === es.comboEtapaId);
              if (etapaBase) {
                  es.opcoes.forEach((op: { produtoLojaId: number; quantidade: number }) => {
                      const optFull = etapaBase.opcoes.find(o => o.produtoLojaId === op.produtoLojaId);
                      if (optFull) {
                          totalEtapas += (optFull.precoAdicional * op.quantidade);
                          textoEtapas += `\n[${etapaBase.titulo}] 1x ${optFull.nomeProduto}`;
                          if (optFull.precoAdicional > 0) {
                              textoEtapas += ` (+ R$ ${(optFull.precoAdicional/100).toFixed(2)})`;
                          }
                      }
                  });
              }
          });
      }
      
      // Cria uma descrição detalhada do combo
      const detalheItens = combo.itens.map((item) => {
          const itemExtras = extrasMap[Number(item.id)] || [];
          const extraText = itemExtras.length > 0 ? ` (+ ${itemExtras.map(e => e.nome).join(', ')})` : '';
          return `${item.quantidade}x ${item.nomeProduto}${extraText}`;
      }).join('\n');

      const fullObservacao = `[COMBO: ${combo.nome}]\n${detalheItens}${textoEtapas}${observacao ? `\nObs: ${observacao}` : ''}`;

      // Produto "fictício" representando o Combo no carrinho
      const produtoCombo: Produto = {
          id: `combo-${combo.id}-${Date.now()}`, 
          nome: `Combo: ${combo.nome}`,
          descricao: combo.descricao,
          preco: combo.preco + totalExtras + totalEtapas, 
          imagemUrl: combo.imagemUrl,
          categoriaId: combo.categoriaId?.toString() || '', 
          lojaId: loja?.id || '',
          adicionais: [], 
          isAdicional: false,
          isCombo: true,
          comboEtapas: etapasSelecionadas
      };

      // Adiciona ao carrinho
      addItem(produtoCombo, quantidade, fullObservacao, []);
      setIsComboModalOpen(false);
  }

  // Determine if store is closed
  const isLojaFechada = loja ? !loja.aberto : false;
  
  // Determine if store is blocked due to license/payment
  const isLojaBloqueada = loja ? (
    loja.bloqueadaPorFaltaDePagamento || 
    (loja.licencaValidaAte && new Date(loja.licencaValidaAte) < new Date())
  ) : false;

  // Filter categories
  const filteredCategories = activeCategory 
    ? cardapio.filter(cat => cat.id === activeCategory)
    : cardapio;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!loja) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loja não encontrada</div>;
  }

  if (isLojaBloqueada) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-t-4 border-red-500">
                {loja.logoUrl && (
                    <img 
                        src={loja.logoUrl} 
                        alt={loja.nome} 
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-gray-50 shadow-sm" 
                    />
                )}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja Indisponível</h1>
                <p className="text-gray-600 mb-6">
                    A loja <strong>{loja.nome}</strong> está temporariamente fechada para novos pedidos.
                </p>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                     <LogOut className="w-8 h-8 text-red-600" />
                </div>
            </div>
        </div>
    );
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
        


        <div className="absolute top-4 right-4 z-20">
            {!isAuthenticated ? (
                <Link to="/identificacao" className="bg-white/90 p-2 px-4 rounded-full shadow-lg hover:bg-white transition-colors flex items-center gap-2 text-gray-800 font-medium text-sm">
                    <User className="w-5 h-5" />
                    Entrar
                </Link> 
            ) : (
                <div className="flex items-center gap-2">
                     <Link to="/perfil" className="bg-white/90 p-2 px-3 rounded-full shadow-lg flex items-center gap-2 text-gray-800 font-medium text-sm hover:bg-gray-50 transition-colors">
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
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-600 border-t pt-4 border-gray-100">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{loja.tempoEntregaMin}-{loja.tempoEntregaMax} min</span>
                    </div>
                    {loja.logradouro && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="line-clamp-1">
                                {loja.logradouro}{loja.numero ? `, ${loja.numero}` : ''}{loja.bairro ? ` - ${loja.bairro}` : ''}{loja.cidade ? `, ${loja.cidade}` : ''}
                            </span>
                        </div>
                    )}
                    {!loja.logradouro && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Entrega: R$ {loja.taxaEntrega.toFixed(2)}</span>
                        </div>
                    )}
                    {(loja.whatsapp || loja.telefone) && (
                        <a 
                            href={`https://wa.me/55${(loja.whatsapp || loja.telefone)?.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium transition-colors shrink-0 ml-auto sm:ml-0"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                        </a>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

       {/* Category Navigation & Search */}
      <div className="sticky top-0 z-20 bg-gray-50 pt-2 pb-2 shadow-sm">
           <div className="max-w-4xl mx-auto px-4 mb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar itens no cardápio..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
           </div>
           
           {!searchQuery && (
                <CategoryNav 
                        categories={cardapio.map(c => ({ id: c.id, nome: c.nome }))}
                        activeCategory={activeCategory}
                        onSelect={setActiveCategory}
                />
           )}
      </div>

       {/* Cardápio */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        {filteredCategories.length === 0 && searchQuery && (

            <div className="text-center py-10 text-gray-500">
                Nehum item encontrado para "{searchQuery}"
            </div>
        )}

        {filteredCategories.map(categoria => {
            const products = categoria.produtos;
            const combos = categoria.combos || [];
            
            return (
                <CategorySection 
                    key={categoria.id} 
                    categoria={categoria} 
                    products={products} 
                    combos={combos}
                    onProductClick={handleProductClick}
                    onComboClick={handleComboClick}
                />
            );
        })}
      </div>

      <ProductModal 
        key={selectedProduct?.id || 'empty'}
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
      
      <MiniCartWidget />
      <PedidosAtivosWidget />
    </div>
  );
}

function CategorySection({ 
    categoria, 
    products, 
    combos, 
    onProductClick, 
    onComboClick 
}: { 
    categoria: Categoria, 
    products: Produto[], 
    combos: Combo[],
    onProductClick: (p: Produto) => void,
    onComboClick: (c: Combo) => void
}) {
    const [expanded, setExpanded] = useState(false);
    const INITIAL_LIMIT = 8; // Increased for grid
    
    const hasMore = products.length > INITIAL_LIMIT;
    const visibleProducts = expanded ? products : products.slice(0, INITIAL_LIMIT);

    return (
        <div id={`cat-${categoria.id}`} className="mb-8 scroll-mt-32">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{categoria.nome}</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                {visibleProducts.map(produto => (
                    <ProductCard key={`prod-${produto.id}`} produto={produto} onClick={onProductClick} />
                ))}
            </div>

            {hasMore && !expanded && (
                <button 
                    onClick={() => setExpanded(true)}
                    className="w-full py-2 bg-white border border-gray-200 rounded-lg text-brand-primary font-medium hover:bg-gray-50 transition-colors mb-4 shadow-sm"
                >
                    Ver mais {products.length - INITIAL_LIMIT} itens em {categoria.nome}
                </button>
            )}

            {/* Combos */}
            {combos && combos.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Combos</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {combos.map(combo => (
                            <ComboCard key={`combo-${combo.id}`} combo={combo} onClick={onComboClick} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components to keep clean
function ProductCard({ produto, onClick }: { produto: Produto, onClick: (p: Produto) => void }) {
    const indisponivel = produto.disponivel === false;
    const cardImageUrl = produto.imagemUrl || (produto.imagens && produto.imagens.length > 0 ? produto.imagens[0].url : undefined);

    let displayPrice = produto.preco;
    let isFrom = false;
    const isConfigurable = produto.modoCardapio === 'Configuravel' || (produto.gruposOpcao && produto.gruposOpcao.length > 0);

    if (produto.variantes && produto.variantes.length > 0) {
        const minVariantePreco = Math.min(...produto.variantes.map(v => v.preco));
        isFrom = true;
        if (minVariantePreco < displayPrice || displayPrice === 0) {
            displayPrice = minVariantePreco;
        }
    } else if (isConfigurable) {
        isFrom = true;
        let base = produto.preco || 0;
        produto.gruposOpcao?.forEach(g => {
            if (g.obrigatorio && g.minSelecao > 0 && g.itens.length > 0) {
                 const minOpcao = Math.min(...g.itens.map(i => i.preco));
                 base += (minOpcao * g.minSelecao);
            }
        });
        displayPrice = base;
    }

    return (
        <div 
            className={`relative rounded-xl overflow-hidden shadow-sm aspect-square transition-all duration-200 
                ${indisponivel ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
            `}
            onClick={() => !indisponivel && onClick(produto)}
        >
            <ProductImage 
                src={cardImageUrl} 
                alt={produto.nome} 
                className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                productType={produto.tipo}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                <h3 className="font-bold text-white leading-tight line-clamp-2">{produto.nome}</h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-white font-semibold flex items-center flex-wrap gap-1">
                        {isFrom && <span className="text-[10px] uppercase font-normal opacity-90">A partir de</span>}
                        {isConfigurable && !isFrom && <span className="text-[10px] uppercase font-normal opacity-90">Personalizável</span>}
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice / 100)}</span>
                    </span>
                    {indisponivel && <span className="text-[10px] font-bold text-black border-white bg-white/90 px-1.5 py-0.5 rounded uppercase shrink-0">Esgotado</span>}
                </div>
            </div>
        </div>
    );
}

function ComboCard({ combo, onClick }: { combo: Combo, onClick: (c: Combo) => void }) {
    const indisponivel = combo.ativo === false;
    
    let displayPrice = combo.preco;
    const hasDynamicStages = combo.etapas && combo.etapas.length > 0;
    
    if (hasDynamicStages) {
        combo.etapas?.filter((e) => e.obrigatorio).forEach((e) => {
            if (e.opcoes.length > 0) {
                 displayPrice += Math.min(...e.opcoes.map((o) => o.precoAdicional));
            }
        });
    }

    return (
        <div 
            className={`relative rounded-xl overflow-hidden shadow-sm aspect-square transition-all duration-200 border-2 border-orange-400
                ${indisponivel ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
            `}
            onClick={() => !indisponivel && onClick(combo)}
        >
            <ProductImage 
                src={combo.imagemUrl} 
                alt={combo.nome} 
                className="absolute inset-0 w-full h-full object-cover bg-orange-100"
                isCombo={true}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    PROMOÇÃO
                </span>
                
                <h3 className="font-bold text-white leading-tight line-clamp-2">{combo.nome}</h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-white font-semibold flex items-center flex-wrap gap-1">
                        {hasDynamicStages && <span className="text-[10px] uppercase font-normal opacity-90">A partir de</span>}
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice / 100)}</span>
                    </span>
                    {indisponivel && <span className="text-[10px] font-bold text-black border-white bg-white/90 px-1.5 py-0.5 rounded uppercase shrink-0">Esgotado</span>}
                </div>
            </div>
        </div>
    );
}
