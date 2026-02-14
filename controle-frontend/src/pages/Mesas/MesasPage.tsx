import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listarMesas, configurarMesas, atualizarApelido, abrirMesa, liberarMesa, type Mesa } from '../../api/mesas.api';
import { Settings, User, CheckCircle, XCircle } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

export function MesasPage() {
  const { activeLoja } = useAuth();
  // const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'map' | 'config'>('map');
  
  // Config State
  const [qtdMesas, setQtdMesas] = useState(10);

  // Abrir Mesa State
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMesas = useCallback(async () => {
    if (!activeLoja?.id) return;
    try {
      setLoading(true);
      const data = await listarMesas(activeLoja.id);
      setMesas(data);
      // Atualiza qtdMesas para o admin se basear
      if (data.length > 0) setQtdMesas(Math.max(...data.map(m => m.numero)));
    } catch (error) {
      console.error('Erro ao buscar mesas', error);
    } finally {
      setLoading(false);
    }
  }, [activeLoja?.id]);

  useEffect(() => {
    fetchMesas();
    const interval = setInterval(fetchMesas, 10000); // Polling status
    return () => clearInterval(interval);
  }, [fetchMesas]);

  const handleConfigurar = async () => {
    if (!activeLoja?.id) return;
    if (!confirm(`Deseja reconfigurar para ter ${qtdMesas} mesas? Isso criará novas mesas se necessário.`)) return;
    try {
      await configurarMesas(activeLoja.id, qtdMesas);
      fetchMesas();
      setMode('map');
    } catch {
       alert('Erro ao configurar mesas');
    }
  };

  const handleUpdateApelido = async (id: number, apelido: string) => {
      try {
          await atualizarApelido(id, apelido);
          fetchMesas(); // Refresh 
      } catch (e) {
          console.error(e);
      }
  };

  const handleMesaClick = (mesa: Mesa) => {
      if (mesa.status === 'Livre') {
          setMesaSelecionada(mesa);
          setNomeCliente('');
          setIsModalOpen(true);
      } else {
          // Se ocupada, pode ir para "Detalhes/Pedido"
          // Opções: "Adicionar Item", "Ver Conta", "Fechar"
          alert(`Mesa ${mesa.numero} Ocupada por ${mesa.clienteNomeTemporario}. (Funcionalidade de Detalhes em Breve)`);
      }
  };

  const handleAbrirMesa = async () => {
      if (!mesaSelecionada) return;
      try {
          await abrirMesa(mesaSelecionada.id, nomeCliente);
          setIsModalOpen(false);
          setMesaSelecionada(null);
          fetchMesas();
      } catch {
          alert('Erro ao abrir mesa');
      }
  };

  const handleLiberarMesa = async (mesa: Mesa) => {
      if(!confirm(`Deseja liberar a mesa ${mesa.numero}? Isso fechará a conta atual.`)) return;
      try {
          await liberarMesa(mesa.id);
          fetchMesas();
      } catch {
          alert('Erro ao liberar mesa');
      }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
             Controle de Mesas <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border">Loja: {activeLoja?.nome}</span>
           </h1>
           <p className="text-gray-500 mt-1">Gerencie o salão e pedidos.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => window.open('http://localhost:5174/garcom', '_blank')} 
             className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium flex items-center gap-2"
             title="Abrir App do Garçom (Simulado)"
           >
             📱 App Garçom
           </button>
           <button 
             onClick={() => setMode(mode === 'map' ? 'config' : 'map')}
             className={`p-2 rounded border ${mode === 'config' ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-100'}`}
             title="Configuração"
           >
             <Settings size={20} />
           </button>
           <button onClick={fetchMesas} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Atualizar</button>
        </div>
      </div>

      {mode === 'config' && (
          <div className="bg-white p-6 rounded shadow mb-6 animate-in slide-in-from-top-4">
              <h2 className="text-lg font-bold mb-4">Configuração do Salão</h2>
              <div className="flex items-end gap-4 max-w-sm">
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Mesas</label>
                      <input 
                        type="number" 
                        value={qtdMesas} 
                        onChange={e => setQtdMesas(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                      />
                  </div>
                  <button onClick={handleConfigurar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-10">
                      Salvar/Gerar
                  </button>
              </div>
          </div>
      )}

      {/* Grid de Mesas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mesas.map(mesa => {
              // Calculate Total
              const total = mesa.pedidoAtual?.sacola?.reduce((acc, item) => {
                  const preco = item.produtoLoja?.produto?.preco || 0; // Ajustar conforme estrutura real
                  return acc + (preco * item.quantidade);
              }, 0) || 0;

              // Calculate Duration
              const duration = mesa.dataAbertura ? Math.floor((new Date().getTime() - new Date(mesa.dataAbertura).getTime()) / 60000) : 0;
              
              return (
              <div 
                key={mesa.id}
                onClick={mode === 'map' ? () => handleMesaClick(mesa) : undefined}
                className={`
                    relative p-4 rounded-xl border-2 shadow-sm flex flex-col items-center justify-between aspect-square transition-all cursor-pointer hover:shadow-md
                    ${mesa.status === 'Livre' ? 'bg-green-50 border-green-200 hover:border-green-400' : ''}
                    ${mesa.status === 'Ocupada' ? 'bg-red-50 border-red-200 hover:border-red-400' : ''}
                    ${mode === 'config' ? 'opacity-70 pointer-events-none' : ''}
                `}
              >
                  <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-gray-700">{mesa.numero}</span>
                      {mesa.nome && <span className="text-xs font-semibold text-gray-500">{mesa.nome}</span>}
                  </div>
                  
                  {mode === 'config' ? (
                      <input 
                        className="mt-2 text-xs text-center border-b border-gray-400 bg-transparent focus:outline-none pointer-events-auto"
                        placeholder="Apelido"
                        defaultValue={mesa.nome}
                        onBlur={(e) => handleUpdateApelido(mesa.id, e.target.value)}
                      />
                  ) : (
                      <div className="w-full text-center">
                        <div className={`mb-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block
                            ${mesa.status === 'Livre' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}
                        `}>
                            {mesa.status}
                        </div>

                        {mesa.clienteNomeTemporario && (
                            <div className="flex flex-col items-center gap-0.5 mt-1">
                                <div className="flex items-center gap-1 text-xs text-gray-800 font-bold">
                                    <User size={12} /> {mesa.clienteNomeTemporario}
                                </div>
                                {mesa.dataAbertura && (
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                        ⏱ {duration} min
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {mesa.status === 'Ocupada' && (
                             <div className="mt-2 w-full border-t pt-1 border-red-200">
                                <span className="text-sm font-bold text-red-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                </span>
                             </div>
                        )}

                        {mesa.status === 'Ocupada' && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleLiberarMesa(mesa); }}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-700 p-1 bg-white/50 rounded-full hover:bg-white"
                                title="Liberar Mesa (Fechar)"
                             >
                                <XCircle size={16} />
                             </button>
                        )}
                      </div>
                  )}
              </div>
          )})}
          
          {mesas.length === 0 && !loading && (
              <div className="col-span-full py-10 text-center text-gray-400">
                  Nenhuma mesa configurada. Use o modo de configuração para adicionar mesas.
              </div>
          )}
      </div>

      {/* Modal Abrir Mesa */}
      {isModalOpen && mesaSelecionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                  <h3 className="text-xl font-bold mb-4">Abrir Mesa {mesaSelecionada.numero}</h3>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente (Opcional)</label>
                  <input 
                    type="text" 
                    value={nomeCliente} 
                    onChange={e => setNomeCliente(e.target.value)}
                    className="w-full border p-2 rounded mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: João Silva"
                    autoFocus
                  />
                  
                  <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 rounded border hover:bg-gray-50"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={handleAbrirMesa}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      >
                          <CheckCircle size={18} /> Abrir Mesa
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
