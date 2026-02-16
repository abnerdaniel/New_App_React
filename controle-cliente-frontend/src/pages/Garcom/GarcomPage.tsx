import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiter } from '../../context/WaiterContext';
import { abrirMesa, atualizarStatusItem, atualizarStatusMesa, type Mesa } from '../../services/mesas';
import { User, LogOut, Lock, CheckCircle, Clock } from 'lucide-react'; 
import axios from 'axios';

// Use env var or default. Must match mesas.ts
const API_URL = 'http://localhost:5024'; 

export function GarcomPage() {
  const navigate = useNavigate();
  /* Refactored Login to use Context */
  const { selecionarMesa, login: loginContext } = useWaiter(); // loginContext alias
  
  // Standalone Auth for Waiter
  // const [waiterUser, setWaiterUser] = useState<{nome: string} | null>(null); // Removed local state
  const { waiterUser, waiterLojaId } = useWaiter(); // Get from context

  const [mesas, setMesas] = useState<Mesa[]>([]);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Modal Abrir
  const [mesaParaAbrir, setMesaParaAbrir] = useState<Mesa | null>(null);
  const [mesaGerenciar, setMesaGerenciar] = useState<Mesa | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');

  const fetchMesas = useCallback(async () => {
      if (!waiterLojaId) return;
      try {
          const token = localStorage.getItem('waiterToken');
          const response = await axios.get<Mesa[]>(`${API_URL}/api/mesas/${waiterLojaId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          setMesas(response.data);
      } catch (err: any) {
          console.error(err);
      }
  }, [waiterLojaId]);

  useEffect(() => {
    if (waiterUser && waiterLojaId) {
        fetchMesas();
        const interval = setInterval(fetchMesas, 5000);
        return () => clearInterval(interval);
    }
  }, [waiterUser, waiterLojaId, fetchMesas]);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoadingLogin(true);
      
      try {
          await loginContext(email, password);
      } catch (err: any) {
          console.error(err);
          setError('Login falhou. Verifique suas credenciais.');
      } finally {
          setLoadingLogin(false);
      }
  };

  // ...

  const handleMesaClick = (mesa: Mesa) => {
      if (mesa.status === 'Livre') {
          setMesaParaAbrir(mesa);
      } else {
          setMesaGerenciar(mesa);
      }
  };

  const confirmAbrirMesa = async () => {
      if (!mesaParaAbrir) return;
      try {
          await abrirMesa(mesaParaAbrir.id, nomeCliente);
          setMesaParaAbrir(null);
          // Refresh immediately
          fetchMesas();
      } catch (e: unknown) {
           console.error(e);
           alert('Erro ao abrir mesa');
      }
  };

  /*
  const handleLogout = () => {
      // Use Context
  };
  */
  // We use the context logout in the onClick directly or verify where it's called
  const { logout } = useWaiter();

  if (!waiterUser || !waiterLojaId) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
              <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg w-full max-w-sm shadow-2xl">
                  <div className="flex justify-center mb-6">
                      <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                        <Lock size={32} />
                      </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Acesso Garçom</h1>
                  <p className="text-center text-gray-500 mb-6 text-sm">Entre com suas credenciais para acessar o salão.</p>
                  
                  {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Login ou Email</label>
                          <input 
                            type="text" 
                            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="seu.usuario"
                            autoFocus
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                          <input 
                            type="password" 
                            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••"
                          />
                      </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loadingLogin}
                    className="w-full bg-blue-600 text-white py-3 rounded font-bold mt-6 hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center"
                  >
                      {loadingLogin ? 'Entrando...' : 'Entrar'}
                  </button>
              </form>
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-gray-100 pb-20">
          <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
              <div>
                  <h1 className="font-bold text-lg text-gray-800">Mapa de Mesas</h1>
                  <p className="text-xs text-gray-500">Logado como {waiterUser.nome}</p>
              </div>
              <button onClick={logout} className="text-red-500 p-2 hover:bg-red-50 rounded">
                  <LogOut size={20}/>
              </button>
          </header>

          <main className="p-4 grid grid-cols-2 gap-4">
              {mesas.map(mesa => (
                  <div 
                    key={mesa.id}
                    onClick={() => handleMesaClick(mesa)}
                        className={`
                        aspect-square rounded-xl shadow-sm flex flex-col items-center justify-center p-2 border-2 cursor-pointer relative transition-transform active:scale-95
                        ${mesa.status === 'Livre' ? 'bg-green-50 border-green-200 text-green-800' : ''}
                        ${mesa.status === 'Ocupada' ? 'bg-white border-gray-200 text-gray-800' : ''}
                        ${mesa.status === 'Pagamento' ? 'bg-orange-50 border-orange-200 text-orange-800 animate-pulse' : ''}
                        ${mesa.status === 'Chamando' ? 'bg-red-50 border-red-200 text-red-800 animate-pulse' : ''}
                        ${mesa.status === 'Cozinha' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
                    `}
                  >
                      <span className="text-3xl font-bold">{mesa.numero}</span>
                      {mesa.nome && <span className="text-xs absolute top-2 font-medium opacity-70">{mesa.nome}</span>}
                      
                      {mesa.clienteNomeTemporario && (
                          <div className="mt-2 text-xs font-semibold flex items-center gap-1 bg-white/60 px-2 py-1 rounded shadow-sm">
                              <User size={12} /> {mesa.clienteNomeTemporario}
                          </div>
                      )}
                      
                      <div className="text-[10px] uppercase font-bold mt-auto opacity-70 bg-white/30 px-2 rounded">
                          {mesa.status}
                      </div>

                      {/* Notificação Visual se Pedido Aberto could go here */}
                  </div>
              ))}
          </main>


          {/* Modal Abrir Mesa */}
          {mesaParaAbrir && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-white w-full max-w-sm rounded-lg p-6 shadow-xl">
                      <h3 className="text-lg font-bold mb-4">Abrir Mesa {mesaParaAbrir.numero}</h3>
                      <input 
                        className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nome do Cliente (Opcional)"
                        value={nomeCliente}
                        onChange={e => setNomeCliente(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setMesaParaAbrir(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                          <button onClick={confirmAbrirMesa} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Abrir</button>
                      </div>
                  </div>
              </div>
          )}

          {/* Modal Gerenciar Mesa */}
          {mesaGerenciar && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold">Mesa {mesaGerenciar.numero}</h3>
                            <p className="text-sm text-gray-500">{mesaGerenciar.nome || 'Sem apelido'}</p>
                        </div>
                        <button onClick={() => setMesaGerenciar(null)} className="text-gray-400 hover:text-gray-600">
                            <span className="text-2xl">&times;</span>
                        </button>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-600">Cliente: <span className="font-bold text-gray-800">{mesaGerenciar.clienteNomeTemporario || 'Não informado'}</span></p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              Status: 
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                  ${mesaGerenciar.status === 'Livre' ? 'bg-green-100 text-green-700' : ''}
                                  ${mesaGerenciar.status === 'Ocupada' ? 'bg-blue-100 text-blue-700' : ''}
                                  ${mesaGerenciar.status === 'Pagamento' ? 'bg-orange-100 text-orange-700' : ''}
                                  ${mesaGerenciar.status === 'Chamando' ? 'bg-red-100 text-red-700' : ''}
                                  ${mesaGerenciar.status === 'Cozinha' ? 'bg-yellow-100 text-yellow-700' : ''}
                              `}>
                                  {mesaGerenciar.status}
                              </span>
                          </p>
                          
                          {/* Quick Status Actions */}
                          <div className="flex flex-wrap gap-2 mt-3">
                              <button 
                                onClick={async () => {
                                    await atualizarStatusMesa(mesaGerenciar.id, 'Ocupada');
                                    setMesaGerenciar({...mesaGerenciar, status: 'Ocupada'}); // Optimistic
                                    fetchMesas();
                                }}
                                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1"
                              >
                                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Normal
                              </button>
                              <button 
                                onClick={async () => {
                                    await atualizarStatusMesa(mesaGerenciar.id, 'Cozinha');
                                    setMesaGerenciar({...mesaGerenciar, status: 'Cozinha'});
                                    fetchMesas();
                                }}
                                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1"
                              >
                                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Aguardando
                              </button>
                              <button 
                                onClick={async () => {
                                    await atualizarStatusMesa(mesaGerenciar.id, 'Pagamento');
                                    setMesaGerenciar({...mesaGerenciar, status: 'Pagamento'});
                                    fetchMesas();
                                }}
                                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1"
                              >
                                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> Pagamento
                              </button>
                          </div>
                      </div>

                      {/* Lista de Pedidos */}
                      <div className="mb-4">
                          <h4 className="font-bold text-gray-700 mb-2 flex justify-between">
                              Consumo
                              <span className="text-green-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                      (mesaGerenciar.pedidoAtual?.sacola?.reduce((acc, item) => acc + (item.precoVenda * item.quantidade), 0) || 0) / 100
                                  )}
                              </span>
                          </h4>
                          <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                              {mesaGerenciar.pedidoAtual?.sacola?.length ? (
                                  mesaGerenciar.pedidoAtual.sacola.map(item => (
                                      <div key={item.id} className="p-3 text-sm border-b last:border-b-0">
                                          
                                          <div className="flex justify-between items-start mb-2">
                                              <div className="flex-1">
                                                  <span className="font-bold text-gray-800 text-base">{item.quantidade}x</span>
                                                  <span className="text-gray-800 ml-2 font-medium">{item.nomeProduto || item.produtoLoja?.produto?.nome}</span>
                                              </div>
                                              <div className="text-gray-600 font-bold">
                                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((item.precoVenda * item.quantidade) / 100)}
                                              </div>
                                          </div>

                                          <div className="flex justify-start">
                                              <button 
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    // Toggle logic: If Entregue -> Pendente. If anything else -> Entregue.
                                                    const nextStatus = item.status === 'Entregue' ? 'Pendente' : 'Entregue';
                                                    
                                                    try {
                                                        await atualizarStatusItem(item.id, nextStatus);
                                                        fetchMesas();
                                                    } catch {
                                                        alert('Erro ao mudar status');
                                                    }
                                                }}
                                                className={`
                                                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border shadow-sm
                                                    ${item.status === 'Entregue' 
                                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                                                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700'}
                                                `}
                                              >
                                                  {item.status === 'Entregue' ? (
                                                      <>
                                                          <CheckCircle size={14} className="text-green-600" />
                                                          <span className="mr-1">Entregue</span>
                                                      </>
                                                  ) : (
                                                      <>
                                                          <Clock size={14} className={item.status === 'Preparando' ? 'text-yellow-500' : 'text-gray-400'} />
                                                          <span className="mr-1">{item.status === 'Preparando' ? 'Preparando...' : 'Aguardando'}</span>
                                                      </>
                                                  )}
                                              </button>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="p-4 text-center text-gray-400 text-sm">Nenhum item lançado.</div>
                              )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                                selecionarMesa(mesaGerenciar);
                                if (waiterLojaId) navigate(`/loja/${waiterLojaId}`);
                            }}
                            className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                          >
                              <span>+ Pedido</span>
                          </button>
                          
                          <button 
                            onClick={async () => {
                                if(!confirm('Deseja realmente fechar a conta desta mesa?')) return;
                                try {
                                    // Use API directly or service alias (need to import liberarMesa if not imported)
                                    // Assuming abrirMesa is imported, verify liberarMesa import.
                                    // Actually axios was used in GarcomPage for list, but liberarMesa service exists.
                                    await axios.post(`${API_URL}/api/mesas/${mesaGerenciar.id}/liberar`);
                                    setMesaGerenciar(null);
                                    fetchMesas();
                                } catch {
                                    alert('Erro ao fechar conta');
                                }
                            }}
                            className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                          >
                              <span>$ Fechar</span>
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
}
