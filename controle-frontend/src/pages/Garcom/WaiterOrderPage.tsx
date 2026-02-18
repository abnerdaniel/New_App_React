import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listarProdutosLoja, type ProdutoLojaItem } from '../../api/mesas.api';
import { api } from '../../api/axios';
import { Search, ShoppingCart, Plus, Minus, Trash2, Banknote, ArrowLeft, Utensils, DollarSign, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface CartItem {
  produtoId: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
  isCombo?: boolean;
}

export function WaiterOrderPage() {
  const { activeLoja } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State passed from GarcomPage
  const mesaState = location.state as { mesaId: number; numeroMesa: number; mesaStatus: string } | null;

  const [activeTab, setActiveTab] = useState<'CARDAPIO' | 'CONTA'>('CARDAPIO');
  const [produtos, setProdutos] = useState<ProdutoLojaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout State
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [trocoPara, setTrocoPara] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mesaConta, setMesaConta] = useState<any>(null); // Details of current table orders

  useEffect(() => {
      if (!mesaState) {
          navigate('/garcom');
          return;
      }

      if (activeLoja?.id) {
        loadProdutos();
      }
      loadMesaDetalhes();
  }, [activeLoja, mesaState?.mesaId, navigate]);



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

  const loadMesaDetalhes = async () => {
      if (!mesaState) return;
      try {
          const response = await api.get(`/api/mesas/${activeLoja?.id}`);
          const mesas = response.data;
          //console.log('Mesas API Response:', mesas);
          const currentMesa = mesas.find((m: any) => m.id === mesaState.mesaId);
          //console.log('Current Mesa Found:', currentMesa);
          //if (currentMesa?.pedidoAtual) {
          //     console.log('Pedido Atual Sacola:', currentMesa.pedidoAtual.sacola);
          //}
          setMesaConta(currentMesa);
      } catch (error) {
          console.error('Erro ao carregar detalhes da mesa', error);
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
              imagemUrl: produto.imagemUrl,
              isCombo: produto.isCombo
          }];
      });
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

  const cartTotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  
  // Calculate existing order total
  const existingTotal = useMemo(() => {
      if (!mesaConta?.pedidoAtual?.sacola) return 0;
      return mesaConta.pedidoAtual.sacola.reduce((acc: number, item: any) => acc + (item.precoVenda * item.quantidade), 0);
  }, [mesaConta]);

  // Format cents to BRL
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);

  const handleEnviarPedido = async () => {
    if (cart.length === 0) return;
    if (!activeLoja?.id) return;
    if (!mesaState) return;

    try {
        setSubmitting(true);
        
        const payload = {
            lojaId: activeLoja.id,
            clienteId: null,
            enderecoEntregaId: null,
            isRetirada: false, // Mesa is treated as Local
            metodoPagamento: 'Dinheiro', // Placeholder, not used for "Enviar Pedido" only
            trocoPara: null,
            observacao: `[Garçom] Mesa ${mesaState.numeroMesa}`,
            NomeCliente: mesaConta?.clienteNomeTemporario || `Mesa ${mesaState.numeroMesa}`,
            enviarParaCozinha: true, 
            numeroMesa: mesaState.numeroMesa,
            itens: cart.map(item => ({
                idProduto: !item.isCombo ? item.produtoId : null,
                idCombo: item.isCombo ? item.produtoId : null,
                qtd: item.quantidade,
                adicionaisIds: [] 
            }))
        };
        
        await api.post('/api/pedidos', payload); 
        
        alert('Pedido enviado para a cozinha!');
        setCart([]);
        loadMesaDetalhes(); // Refresh table details
        setActiveTab('CONTA'); // Switch to bill view? Or stay? Let's stay or go to map.
    } catch (error: any) {
        console.error('Erro ao enviar pedido', error);
        alert('Erro ao enviar pedido.');
    } finally {
        setSubmitting(false);
    }
  };

  const handleFecharConta = async () => {
      if (!mesaState) return;
      if(!confirm(`Deseja fechar a conta da Mesa ${mesaState.numeroMesa}? Total: ${formatCurrency(existingTotal)}`)) return;
      
      try {
          setSubmitting(true);
          // 1. If there are cart items, warn user?
          if (cart.length > 0) {
              if(!confirm('Existem itens no carrinho não enviados. Eles serão descartados. Continuar?')) {
                  setSubmitting(false);
                  return;
              }
          }

          // 2. Call close endpoint
          // Note: The existing endpoint is just /liberar which clears the table.
          // Ideally we would record the payment method.
          // For now, I'll simulate recording payment by calling an endpoint or just freeing the table as the user asked for "fechamento".
          
          await api.post(`/api/mesas/${mesaState.mesaId}/liberar`);
          
          alert('Mesa fechada com sucesso!');
          navigate('/garcom');

      } catch (error) {
          console.error('Erro ao fechar conta', error);
          alert('Erro ao fechar conta.');
      } finally {
          setSubmitting(false);
      }
  };

  if (!mesaState) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex items-center gap-4 shrink-0">
          <button onClick={() => navigate('/garcom')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
              <h1 className="font-bold text-lg text-gray-800">Mesa {mesaState.numeroMesa}</h1>
              <p className="text-xs text-gray-500">{mesaConta?.clienteNomeTemporario || 'Sem cliente identificado'}</p>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
             {mesaConta?.status || 'Livre'}
          </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b bg-white shrink-0">
          <button 
            onClick={() => setActiveTab('CARDAPIO')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'CARDAPIO' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'}`}
          >
              <Utensils size={18} /> Cardápio
          </button>
          <button 
            onClick={() => setActiveTab('CONTA')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'CONTA' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'}`}
          >
              <DollarSign size={18} /> Conta ({formatCurrency(existingTotal + cartTotal)})
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 custom-scrollbar">
          
          {/* TAB: CARDAPIO */}
          {activeTab === 'CARDAPIO' && (
              <div className="space-y-4">
                  {/* Search */}
                  <div className="bg-white p-3 rounded-lg border flex items-center gap-2 shadow-sm sticky top-0 z-10">
                      <Search className="text-gray-400" size={20} />
                      <input 
                        type="text"
                        placeholder="Buscar produtos..."
                        className="flex-1 outline-none text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredProdutos.map(produto => (
                          <div key={produto.id} className="bg-white p-3 rounded-lg border shadow-sm flex gap-3">
                              <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                  {produto.imagemUrl ? (
                                      <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                                          <Utensils size={20} />
                                      </div>
                                  )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                      <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{produto.nome}</h3>
                                      <p className="text-xs text-gray-500 line-clamp-2">{produto.descricao}</p>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                      <span className="font-bold text-brand-primary">{formatCurrency(produto.preco)}</span>
                                      <button 
                                        onClick={() => addToCart(produto)}
                                        className="bg-brand-primary text-white p-1.5 rounded-full hover:bg-brand-hover shadow-sm"
                                      >
                                          <Plus size={16} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* TAB: CONTA */}
          {activeTab === 'CONTA' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Current Cart (Novos Itens) */}
                  {cart.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border p-4">
                          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <ShoppingCart size={18} className="text-blue-600" /> 
                              Novos Itens (A Enviar)
                          </h3>
                          <div className="space-y-3">
                              {cart.map(item => (
                                  <div key={item.produtoId} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                      <div>
                                          <p className="font-medium text-gray-800">{item.nome}</p>
                                          <p className="text-xs text-brand-primary font-bold">{formatCurrency(item.preco)} x {item.quantidade}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1 bg-gray-100 rounded">
                                              <button onClick={() => updateQuantity(item.produtoId, -1)} className="p-1 text-gray-600"><Minus size={14}/></button>
                                              <span className="text-sm font-bold">{item.quantidade}</span>
                                              <button onClick={() => updateQuantity(item.produtoId, 1)} className="p-1 text-gray-600"><Plus size={14}/></button>
                                          </div>
                                          <button onClick={() => removeFromCart(item.produtoId)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                              <span className="text-gray-600">Total Novos</span>
                              <span className="font-bold text-lg text-blue-600">{formatCurrency(cartTotal)}</span>
                          </div>
                          <button 
                            onClick={handleEnviarPedido}
                            disabled={submitting}
                            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                          > 
                              Enviar para Cozinha
                          </button>
                      </div>
                  )}

                  {/* Consumo da Mesa (Itens Já Enviados) */}
                  <div className="bg-white rounded-xl shadow-sm border p-4">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-600" />
                          Consumo Confirmado
                      </h3>
                      {mesaConta?.pedidoAtual?.sacola?.length ? (
                          <div className="space-y-3">
                              {mesaConta.pedidoAtual.sacola.map((item: any) => (
                                  <div key={item.id} className="flex justify-between items-start border-b pb-2 last:border-0 last:pb-0">
                                      <div>
                                          <p className="font-medium text-gray-800">{item.nomeProduto || item.produtoLoja?.produto?.nome}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-gray-500">{item.quantidade}x</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${
                                                item.status === 'Entregue' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                          </div>
                                      </div>
                                      <span className="font-bold text-gray-700 text-sm">
                                          {formatCurrency(item.precoVenda * item.quantidade)}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-center text-gray-400 text-sm py-4">Nenhum pedido confirmado.</p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Subtotal Confirmado</span>
                          <span className="font-bold text-lg text-gray-800">{formatCurrency(existingTotal)}</span>
                      </div>
                  </div>

                  {/* Payment Section */}
                  <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-green-500">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Banknote size={20} className="text-green-600" /> 
                          Finalizar Conta
                      </h3>
                      
                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Dinheiro', 'Cartão', 'Pix'].map(method => (
                                  <button
                                      key={method}
                                      onClick={() => setMetodoPagamento(method)}
                                      className={`py-2 rounded border text-sm font-medium transition-colors ${
                                          metodoPagamento === method 
                                          ? 'bg-green-600 text-white border-green-600' 
                                          : 'bg-white text-gray-600 hover:bg-gray-50'
                                      }`}
                                  >
                                      {method}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {metodoPagamento === 'Dinheiro' && (
                          <div className="mb-4">
                               <label className="block text-sm font-medium text-gray-700 mb-1">Troco para (R$)</label>
                               <input 
                                   type="text"
                                   value={trocoPara}
                                   onChange={e => setTrocoPara(e.target.value.replace(/[^0-9,]/g, ''))}
                                   placeholder="Ex: 50,00"
                                   className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                               />
                          </div>
                      )}

                      <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-lg">
                          <span className="font-bold text-xl text-gray-800">Total Final</span>
                          <div className="text-right">
                              <span className="block font-bold text-2xl text-brand-primary">{formatCurrency(existingTotal + cartTotal)}</span>
                              {cartTotal > 0 && <span className="text-xs text-blue-600">(Inclui novos itens)</span>}
                          </div>
                      </div>

                      <button 
                        onClick={handleFecharConta}
                        disabled={submitting || (existingTotal + cartTotal === 0)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <CheckCircle size={20} />
                          Fechar Conta e Liberar Mesa
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Mobile Floating Action Button for Cart (if in Cardapio tab) */}
      {activeTab === 'CARDAPIO' && cart.length > 0 && (
           <div className="fixed bottom-4 left-4 right-4 md:hidden">
               <button 
                 onClick={() => setActiveTab('CONTA')}
                 className="w-full bg-brand-primary text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-bounce-in"
               >
                   <div className="flex items-center gap-2">
                       <ShoppingCart size={20} />
                       <span className="font-bold">{cart.reduce((a,b)=>a+b.quantidade,0)} itens</span>
                   </div>
                   <span className="font-bold">{formatCurrency(cartTotal)}</span>
               </button>
           </div>
      )}
    </div>
  );
}
