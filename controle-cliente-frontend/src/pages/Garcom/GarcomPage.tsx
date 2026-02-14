import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiter } from '../../context/WaiterContext';
import { abrirMesa, type Mesa } from '../../services/mesas';
import { User, LogOut, Lock } from 'lucide-react'; 
import axios from 'axios';

// Use env var or default. Must match mesas.ts
const API_URL = 'http://localhost:5024'; 

export function GarcomPage() {
  const navigate = useNavigate();
  const { entrarModoGarcom, selecionarMesa } = useWaiter();
  
  // Standalone Auth for Waiter
  const [waiterUser, setWaiterUser] = useState<{nome: string} | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Modal Abrir
  const [mesaParaAbrir, setMesaParaAbrir] = useState<Mesa | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');

  // Get LojaId from user context or fetch it
  // Assuming the user logged in is a Funcionario, they have a LojaId.
  // We need to extract it from the token or user object.
  // For now, let's assume the AuthResponse puts it in local storage or user object.
  // If not, we might need to fetch it.
  // Let's assume user object has it or we use a hardcoded one if user is Admin testing.
  // Actually, AuthResponse has `Funcionarios` list.
  // We need to pick the loja.
  
  const [lojaId, setLojaId] = useState<string | null>(localStorage.getItem('waiterLojaId'));

  // Restore user session if exists
  useEffect(() => {
      const storedUser = localStorage.getItem('waiterUser');
      if (storedUser) {
          try {
              setWaiterUser(JSON.parse(storedUser));
          } catch {
              localStorage.removeItem('waiterUser');
          }
      }
  }, []);

  const fetchMesas = useCallback(async () => {
      if (!lojaId) return;
      try {
          // Add bearer token if needed. For now assume public or handle auth in axios config if we were using a centralized api instance.
          // Since we use direct axios here, we might need headers.
          // However, MesasController requires Authorize.
          const token = localStorage.getItem('waiterToken');
          const response = await axios.get<Mesa[]>(`${API_URL}/api/mesas/${lojaId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          setMesas(response.data);
      } catch (err: unknown) {
          console.error(err);
      }
  }, [lojaId]);

  useEffect(() => {
    if (waiterUser && lojaId) {
        entrarModoGarcom();
        fetchMesas();
        const interval = setInterval(fetchMesas, 5000);
        return () => clearInterval(interval);
    }
  }, [waiterUser, lojaId, entrarModoGarcom, fetchMesas]);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoadingLogin(true);
      
      try {
          const response = await axios.post(`${API_URL}/api/auth/login`, { login: email, password });
          const data = response.data;
          
          if (data.token) {
              const token = data.token;
              localStorage.setItem('waiterToken', token);
              
              // Determine Loja
              let selectedLojaId = '';
              if (data.funcionarios && data.funcionarios.length > 0) {
                  // Prioritize Employee Role
                  const func = data.funcionarios[0];
                  if (func.lojaId) selectedLojaId = func.lojaId;
              } else if (data.lojas && data.lojas.length > 0) {
                   // Owner Role
                   selectedLojaId = data.lojas[0].id;
              }
              
              if (selectedLojaId) {
                  localStorage.setItem('waiterLojaId', selectedLojaId);
                  setLojaId(selectedLojaId);
                  
                  const userObj = { nome: data.nome };
                  localStorage.setItem('waiterUser', JSON.stringify(userObj));
                  setWaiterUser(userObj);
              } else {
                  setError('Usuário não vinculado a nenhuma loja/equipe.');
              }
          }
      } catch (err: unknown) { // Typed as unknown
          console.error(err);
          setError('Login falhou. Verifique suas credenciais.');
      } finally {
          setLoadingLogin(false);
      }
  };

  const handleMesaClick = (mesa: Mesa) => {
      if (mesa.status === 'Livre') {
          setMesaParaAbrir(mesa);
      } else {
          selecionarMesa({
              ...mesa,
              // Ensure compatibility if types differ slightly, though they shouldn't now
          });
          // Navigate to Loja URL with store ID
          // Must ensure this route exists in Client App
          if (lojaId) {
              navigate(`/loja/${lojaId}`);
          }
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

  const handleLogout = () => {
      localStorage.removeItem('waiterToken');
      localStorage.removeItem('waiterLojaId');
      localStorage.removeItem('waiterUser');
      setWaiterUser(null);
      setLojaId(null);
  };

  if (!waiterUser || !lojaId) {
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
              <button onClick={handleLogout} className="text-red-500 p-2 hover:bg-red-50 rounded">
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
                        ${mesa.status === 'Livre' ? 'bg-green-100 border-green-200 text-green-800' : ''}
                        ${mesa.status === 'Ocupada' ? 'bg-red-100 border-red-200 text-red-800' : ''}
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
      </div>
  );
}
