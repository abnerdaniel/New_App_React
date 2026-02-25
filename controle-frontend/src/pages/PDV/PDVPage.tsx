import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listarProdutosLoja, type ProdutoLojaItem } from '../../api/mesas.api';
import { api } from '../../api/axios';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote,  User, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface CartItem {
  produtoId: number; // ProdutoLojaId
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
  imagemUrl?: string;
}

export function PDVPage() {
  const { activeLoja } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mesa State from Navigation
  const mesaState = location.state as { mesaId: number; numeroMesa: number } | null;
  const isMesaOrder = !!mesaState;

  const [produtos, setProdutos] = useState<ProdutoLojaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout State
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [nomeCliente, setNomeCliente] = useState(''); 
  const [cpfCliente, setCpfCliente] = useState('');
  const [observacaoPedido, setObservacaoPedido] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [desconto, setDesconto] = useState('');
  const [enviarParaCozinha, setEnviarParaCozinha] = useState(true); 
  const [enviarParaEntrega, setEnviarParaEntrega] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(true);

  useEffect(() => {
    if (activeLoja?.id) {
        loadProdutos();
    }
  }, [activeLoja]);

  useEffect(() => {
    if (isMesaOrder) {
        setEnviarParaCozinha(true);
    }
  }, [isMesaOrder]);

  const loadProdutos = async () => {
      try {
          setLoading(true);
          if (activeLoja?.id) {
            const data = await listarProdutosLoja(activeLoja.id);
            setProdutos(data);
          }
      } catch (error) {
          console.error('Erro ao carregar produtos', error);
      } finally {
          setLoading(false);
      }
  };

  const filteredProdutos = useMemo(() => {
      if (!searchTerm) return produtos;
      const lower = searchTerm.toLowerCase();
      return produtos.filter(p => 
          p.nome.toLowerCase().includes(lower) || 
          p.descricao?.toLowerCase().includes(lower) ||
          p.categoriaNome?.toLowerCase().includes(lower)
      );
  }, [produtos, searchTerm]);

  const addToCart = (produto: ProdutoLojaItem) => {
      setCart(prev => {
          const existing = prev.find(item => item.produtoId === produto.id);
          if (existing) {
              return prev.map(item => item.produtoId === produto.id 
                  ? { ...item, quantidade: item.quantidade + 1 } 
                  : item
              );
          }
          return [...prev, {
              produtoId: produto.id,
              nome: produto.nome,
              preco: produto.preco || 0,
              quantidade: 1,
              imagemUrl: produto.imagemUrl
          }];
      });
      if (window.innerWidth < 768) {
        setIsCartOpen(true);
      }
  };

  const removeFromCart = (produtoId: number) => {
      setCart(prev => prev.filter(item => item.produtoId !== produtoId));
  };

  const updateQuantity = (produtoId: number, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.produtoId === produtoId) {
              return { ...item, quantidade: Math.max(1, item.quantidade + delta) };
          }
          return item;
      }));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = parseFloat(desconto.replace(',', '.')) || 0;
  const cartTotal = Math.max(0, cartSubtotal - (valorDesconto * 100)); // Preco in cents

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((val || 0) / 100);

  const valorRecebidoNum = parseFloat(valorRecebido.replace(',', '.')) || 0;
  const trocoCalculado = Math.max(0, valorRecebidoNum - (cartTotal / 100));

  const applyQuickMoney = (amount: number) => {
    setValorRecebido(amount.toFixed(2).replace('.', ','));
  };

  const handleFinalizar = async () => {
    if (cart.length === 0) return;
    if (!activeLoja?.id) return;

    try {
        setSubmitting(true);
        
        const payload = {
            lojaId: activeLoja.id,
            clienteId: null,
            enderecoEntregaId: null,
            isRetirada: !enviarParaEntrega,
            metodoPagamento: isMesaOrder ? 'Dinheiro' : metodoPagamento, 
            trocoPara: valorRecebidoNum > 0 ? valorRecebidoNum : null,
            observacao: `[PDV] ${observacaoPedido} ${nomeCliente ? `- Cliente: ${nomeCliente}` : ''} ${cpfCliente ? `- CPF: ${cpfCliente}` : ''}`,
            NomeCliente: nomeCliente,
            enviarParaCozinha: enviarParaCozinha, 
            numeroMesa: mesaState?.numeroMesa || null,
            itens: cart.map(item => ({
                idProduto: item.produtoId,
                qtd: item.quantidade,
                adicionaisIds: [] 
            }))
        };
        
        await api.post('/api/pedidos', payload); 
        
        alert(isMesaOrder ? 'Pedido enviado para a mesa!' : 'Venda realizada com sucesso!');
        
        if (isMesaOrder) {
            navigate('/garcom'); 
            return;
        }

        setCart([]);
        setIsCheckoutOpen(false);
        setMetodoPagamento('Dinheiro');
        setNomeCliente('');
        setCpfCliente('');
        setObservacaoPedido('');
        setValorRecebido('');
        setDesconto('');
        setEnviarParaCozinha(false);
        setEnviarParaEntrega(false);

    } catch (error: any) {
        console.error('Erro ao finalizar venda', error);
        const msg = error.response?.data?.message || error.message || 'Erro ao finalizar venda.';
        alert(`Erro: ${msg}`);
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 overflow-hidden relative rounded-xl border border-gray-200 shadow-sm w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
      
      {/* Esquerda: Catálogo de Produtos */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
         {/* Barra de Busca e Header */}
         <div className="bg-white p-3 border-b flex items-center gap-2 shrink-0 z-20">
            {isMesaOrder && (
                <button onClick={() => navigate('/garcom')} className="mr-2 p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft size={20} />
                </button>
            )}
            
            <Search className="text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar produtos..."
              className="flex-1 outline-none text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            {isMesaOrder && (
                <div className="hidden md:flex bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold items-center gap-1">
                    <User size={14} /> Mesa {mesaState.numeroMesa}
                </div>
            )}
            {/* Desktop Cart Toggle (When Closed) */}
            {!isDesktopCartOpen && (
                <button 
                    onClick={() => setIsDesktopCartOpen(true)}
                    className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-primary bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                    <ShoppingCart size={18} />
                    Ver Carrinho ({cart.reduce((a, b) => a + b.quantidade, 0)})
                </button>
            )}
         </div>

         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             {loading ? (
                 <div className="flex justify-center py-10">Carregando produtos...</div>
             ) : (
                <div className="space-y-6 pb-20 md:pb-0">
                    {Object.entries(
                        filteredProdutos.reduce((acc, produto) => {
                            const cat = produto.categoriaNome || 'Outros';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(produto);
                            return acc;
                        }, {} as Record<string, ProdutoLojaItem[]>)
                    ).map(([categoria, itens]) => (
                        <div key={categoria}>
                            <h3 className="font-bold text-lg text-gray-700 mb-3 border-b pb-1 bg-gray-50 pt-2">
                                {categoria} ({itens.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {itens.map(produto => (
                                    <button 
                                        key={produto.id}
                                        onClick={() => addToCart(produto)}
                                        className="bg-white p-3 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-row md:flex-col h-full group gap-3 md:gap-0 items-center md:items-stretch"
                                    >
                                        <div className="w-20 h-20 md:w-full md:h-32 shrink-0">
                                            {produto.imagemUrl ? (
                                                <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover rounded-md bg-gray-100" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-300">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div className="md:mt-2">
                                                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">{produto.nome}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 md:mb-2">{produto.descricao}</p>
                                            </div>
                                            
                                            <div className="mt-auto pt-2 flex justify-between items-center w-full">
                                                <span className="font-bold text-brand-primary">{formatCurrency(produto.preco || 0)}</span>
                                                <div className="bg-blue-50 text-blue-600 p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <Plus size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
             )}
         </div>
      </div>

      {/* Mobile Cart Toggle Button */}
      <div className="md:hidden fixed bottom-16 left-4 right-4 z-30">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-brand-primary text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-bounce-in"
          >
              <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <ShoppingCart size={24} />
                  </div>
                  <span className="font-bold">{cart.reduce((a, b) => a + b.quantidade, 0)} itens</span>
              </div>
              <div className="text-xl font-bold">
                  {formatCurrency(cartTotal)}
              </div>
          </button>
      </div>

      {/* Direita: Carrinho / Checkout (Responsive Overlay + Desktop Collapsible) */}
      <div className={`
          fixed inset-0 z-40 bg-white flex flex-col transition-all duration-300 shadow-2xl md:shadow-none
          md:static md:border-l md:bg-white md:h-full
          ${isCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          ${isDesktopCartOpen ? 'md:w-80 md:opacity-100 md:mr-0' : 'md:w-0 md:opacity-0 md:overflow-hidden md:p-0'}
      `}>
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <ShoppingCart size={20} />
                  Carrinho
                  <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                      {cart.reduce((a, b) => a + b.quantidade, 0)} items
                  </span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Mobile Close */}
                <button 
                    onClick={() => setIsCartOpen(false)}
                    className="md:hidden p-2 hover:bg-gray-200 rounded-full"
                >
                    Close
                </button>
                {/* Desktop Collapse */}
                <button 
                    onClick={() => setIsDesktopCartOpen(false)}
                    className="hidden md:block p-1 hover:bg-gray-200 rounded text-gray-500"
                    title="Ocultar Carrinho"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                </button>
              </div>
          </div>
          
          {isMesaOrder && (
               <div className="bg-green-100 p-2 text-center text-green-800 text-xs font-bold border-b border-green-200">
                   Adicionando à Mesa {mesaState.numeroMesa}
               </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white min-h-0 custom-scrollbar">
              {cart.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-3">
                      <ShoppingCart size={48} className="opacity-20" />
                      <p>Nenhum item adicionado</p>
                  </div>
              ) : (
                  cart.map(item => (
                      <div key={item.produtoId} className="p-3 rounded-lg bg-gray-50 border group hover:border-brand-primary transition-colors">
                          {/* Top Row: Name and Remove */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">{item.nome}</span>
                              <button 
                                onClick={() => removeFromCart(item.produtoId)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                          
                          {/* Bottom Row: Price and Controls */}
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-brand-primary font-bold">{formatCurrency(item.preco * item.quantidade)}</span>
                              
                              <div className="flex items-center gap-1 bg-white rounded border shadow-sm">
                                  <button 
                                    onClick={() => updateQuantity(item.produtoId, -1)}
                                    className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-l"
                                  >
                                      <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-bold w-8 text-center">{item.quantidade}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.produtoId, 1)}
                                    className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-r"
                                  >
                                      <Plus size={14} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>

          <div className="p-4 bg-gray-50 border-t space-y-3 shrink-0 pb-safe md:pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
              <div className="flex justify-between font-medium text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              {valorDesconto > 0 && (
                <div className="flex justify-between font-medium text-red-500 text-sm">
                    <span>Desconto</span>
                    <span>- {formatCurrency(valorDesconto * 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cart.length === 0}
                className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                  <Banknote size={20} />
                  {isMesaOrder ? 'Enviar para Mesa' : 'Finalizar Venda'}
              </button>
          </div>
      </div>

      {/* Modal Checkout */}
      {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fade-in-down h-full md:h-auto overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CreditCard size={24} className="text-blue-600" />
                      {isMesaOrder ? 'Confirmar Pedido' : 'Pagamento'}
                  </h3>
                  
                  <div className="space-y-4">
                      {!isMesaOrder && (
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido</label>
                              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                <button 
                                    onClick={() => setEnviarParaEntrega(false)} 
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!enviarParaEntrega ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Retirada / Balcão
                                </button>
                                <button 
                                    onClick={() => setEnviarParaEntrega(true)} 
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${enviarParaEntrega ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Entrega
                                </button>
                              </div>
                          </div>
                      )}

                      {!isMesaOrder && (
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                              <div className="grid grid-cols-3 gap-2">
                                  {['Dinheiro', 'Cartão', 'Pix'].map(method => (
                                      <button
                                          key={method}
                                          onClick={() => setMetodoPagamento(method)}
                                          className={`py-2 rounded border text-sm font-medium transition-colors ${
                                              metodoPagamento === method 
                                              ? 'bg-blue-600 text-white border-blue-600' 
                                              : 'bg-white text-gray-600 hover:bg-gray-50'
                                          }`}
                                      >
                                          {method}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {(!isMesaOrder && metodoPagamento === 'Dinheiro') && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Recebido (R$)</label>
                              <div className="flex gap-2 mb-2">
                                  <input 
                                      type="text"
                                      value={valorRecebido}
                                      onChange={e => setValorRecebido(e.target.value.replace(/[^0-9,]/g, ''))}
                                      placeholder="Ex: 50,00"
                                      className="flex-1 border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-right font-medium"
                                  />
                              </div>
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                  <button onClick={() => applyQuickMoney(cartTotal / 100)} className="bg-white border text-xs py-1 rounded hover:bg-gray-50 text-gray-700 font-medium">Exato</button>
                                  <button onClick={() => applyQuickMoney(10)} className="bg-white border text-xs py-1 rounded hover:bg-gray-50 text-gray-700 font-medium">R$ 10</button>
                                  <button onClick={() => applyQuickMoney(50)} className="bg-white border text-xs py-1 rounded hover:bg-gray-50 text-gray-700 font-medium">R$ 50</button>
                                  <button onClick={() => applyQuickMoney(100)} className="bg-white border text-xs py-1 rounded hover:bg-gray-50 text-gray-700 font-medium">R$ 100</button>
                              </div>
                              <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-green-200 text-green-800">
                                  <span>Troco:</span>
                                  <span>{trocoCalculado > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trocoCalculado) : 'R$ 0,00'}</span>
                              </div>
                          </div>
                      )}

                      {!isMesaOrder && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
                                <input 
                                    type="text"
                                    value={desconto}
                                    onChange={e => setDesconto(e.target.value.replace(/[^0-9,]/g, ''))}
                                    placeholder="0,00"
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-right text-red-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Nota)</label>
                                <input 
                                    type="text"
                                    value={cpfCliente}
                                    onChange={e => setCpfCliente(e.target.value.replace(/[^0-9.-]/g, ''))}
                                    placeholder="000.000.000-00"
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                      )}

                      {!isMesaOrder && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text"
                                    value={nomeCliente}
                                    onChange={e => setNomeCliente(e.target.value)}
                                    placeholder="Identificação do pedido (opcional)"
                                    className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                      )}

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                          <textarea 
                              value={observacaoPedido}
                              onChange={e => setObservacaoPedido(e.target.value)}
                              rows={2}
                              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              placeholder="Detalhes adicionais..."
                          />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                          <input 
                            type="checkbox" 
                            id="enviarCozinha" 
                            checked={enviarParaCozinha} 
                            disabled={isMesaOrder} // Locked for Mesa
                            onChange={e => setEnviarParaCozinha(e.target.checked)}
                            className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary border-gray-300 disabled:opacity-50"
                          />
                          <label htmlFor="enviarCozinha" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                              Enviar pedido para a cozinha/bar?
                          </label>
                      </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white pt-2 border-t">
                      <button 
                          onClick={() => setIsCheckoutOpen(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={handleFinalizar}
                          disabled={submitting}
                          className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-70 flex items-center gap-2"
                      >
                          {submitting ? 'Processando...' : (
                              <>
                                <CheckCircle size={18} /> Confirmar
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
