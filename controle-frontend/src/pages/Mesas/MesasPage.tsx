import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listarMesas, configurarMesas, atualizarApelido, abrirMesa, liberarMesa, removerItemPedido, aplicarDesconto, listarProdutosLoja, adicionarItemPedido, atualizarStatusItem, atualizarStatusMesa, type Mesa, type ProdutoLojaItem } from '../../api/mesas.api';
import { Settings, User, CheckCircle, XCircle, Clock, ChefHat, Eye, Unlock, Trash2, Percent, Plus, Search } from 'lucide-react';

export function MesasPage() {
  const { activeLoja } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'map' | 'config'>('map');
  
  // Config State
  const [qtdMesas, setQtdMesas] = useState(10);

  // Abrir Mesa State
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detail Modal State
  const [detailMesa, setDetailMesa] = useState<Mesa | null>(null);
  const [descontoInput, setDescontoInput] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Add Item State
  const [produtosLoja, setProdutosLoja] = useState<ProdutoLojaItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchProduto, setSearchProduto] = useState('');

  const fetchMesas = useCallback(async () => {
    if (!activeLoja?.id) return;
    try {
      setLoading(true);
      const data = await listarMesas(activeLoja.id);
      setMesas(data);
      if (data.length > 0) setQtdMesas(Math.max(...data.map(m => m.numero)));
    } catch (error) {
      console.error('Erro ao buscar mesas', error);
    } finally {
      setLoading(false);
    }
  }, [activeLoja?.id]);

  useEffect(() => {
    fetchMesas();
    const interval = setInterval(fetchMesas, 10000);
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
          fetchMesas();
      } catch (e) {
          console.error(e);
      }
  };

  useEffect(() => {
    if (detailMesa?.id && activeLoja?.id) {
        const loadProdutos = async () => {
             try {
              console.log('Buscando produtos para loja:', activeLoja.id);
              const produtos = await listarProdutosLoja(activeLoja.id);
              console.log('Produtos retornados:', produtos);
              setProdutosLoja(produtos);
            } catch (error) {
              console.error('Erro ao carregar produtos', error);
            }
        };
        loadProdutos();
    }
  }, [detailMesa?.id, activeLoja?.id]);

  const handleMesaClick = async (mesa: Mesa) => {
      if (mesa.status === 'Livre') {
          setMesaSelecionada(mesa);
          setNomeCliente('');
          setIsModalOpen(true);
      } else {
          setDetailMesa(mesa);
          setShowAddItem(false);
          setSearchProduto('');
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
          setDetailMesa(null);
          fetchMesas();
      } catch {
          alert('Erro ao liberar mesa');
      }
  };

  // Derived data
  const mesasOcupadas = mesas.filter(m => m.status !== 'Livre' && m.pedidoAtual);

  const getWaitTime = (mesa: Mesa) => {
    if (!mesa.dataAbertura) return 0;
    return Math.floor((new Date().getTime() - new Date(mesa.dataAbertura).getTime()) / 60000);
  };

  const getWaitColor = (minutes: number) => {
    if (minutes < 15) return 'text-green-600 bg-green-50';
    if (minutes < 30) return 'text-yellow-600 bg-yellow-50';
    if (minutes < 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getTotal = (mesa: Mesa) => {
    return mesa.pedidoAtual?.sacola?.reduce((acc, item) => {
      return acc + (item.precoVenda * item.quantidade);
    }, 0) || 0;
  };

  const formatCurrency = (valueCents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueCents / 100);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
             Controle de Mesas <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border">Loja: {activeLoja?.nome}</span>
           </h1>
           <p className="text-gray-500 mt-1">Gerencie o salão e pedidos.</p>
        </div>
        <div className="flex gap-2">
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

      {/* Configuração */}
      {mode === 'config' && (
          <div className="bg-white p-6 rounded shadow mb-6">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-gray-700">{mesas.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{mesas.filter(m => m.status === 'Livre').length}</div>
          <div className="text-xs text-green-600 uppercase tracking-wider">Livres</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{mesasOcupadas.length}</div>
          <div className="text-xs text-red-600 uppercase tracking-wider">Ocupadas</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(mesasOcupadas.reduce((acc, m) => acc + getTotal(m), 0))}</div>
          <div className="text-xs text-blue-600 uppercase tracking-wider">Faturamento Ativo</div>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3 mb-8">
          {mesas.map(mesa => {
              const total = getTotal(mesa);
              const duration = getWaitTime(mesa);
              
              return (
              <div 
                key={mesa.id}
                onClick={mode === 'map' ? () => handleMesaClick(mesa) : undefined}
                className={`
                    relative p-3 rounded-xl border-2 shadow-sm flex flex-col items-center justify-between aspect-square transition-all cursor-pointer hover:shadow-md
                    ${mesa.status === 'Livre' ? 'bg-green-50 border-green-200 hover:border-green-400' : ''}
                    ${mesa.status === 'Ocupada' ? 'bg-white border-gray-200 hover:border-gray-400' : ''}
                    ${mesa.status === 'Pagamento' ? 'bg-orange-50 border-orange-200 hover:border-orange-400 animate-pulse' : ''}
                    ${mesa.status === 'Chamando' ? 'bg-red-50 border-red-200 hover:border-red-400 animate-pulse' : ''}
                    ${mesa.status === 'Cozinha' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-400' : ''}
                    ${!['Livre', 'Ocupada', 'Pagamento', 'Chamando', 'Cozinha'].includes(mesa.status) ? 'bg-gray-50 border-gray-200' : ''}
                    ${mode === 'config' ? 'opacity-70 pointer-events-none' : ''}
                `}
              >
                  <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-700">{mesa.numero}</span>
                      {mesa.nome && <span className="text-[10px] font-semibold text-gray-500">{mesa.nome}</span>}
                  </div>
                  
                  {mode === 'config' ? (
                      <input 
                        className="mt-2 text-xs text-center border-b border-gray-400 bg-transparent focus:outline-none pointer-events-auto w-full"
                        placeholder="Apelido"
                        defaultValue={mesa.nome}
                        onBlur={(e) => handleUpdateApelido(mesa.id, e.target.value)}
                      />
                  ) : (
                      <div className="w-full text-center">
                        <div className={`mb-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block
                            ${mesa.status === 'Livre' ? 'bg-green-100 text-green-800' : ''}
                            ${mesa.status === 'Ocupada' ? 'bg-gray-100 text-gray-800' : ''}
                            ${mesa.status === 'Pagamento' ? 'bg-orange-100 text-orange-800' : ''}
                            ${mesa.status === 'Chamando' ? 'bg-red-100 text-red-800' : ''}
                            ${mesa.status === 'Cozinha' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                            {mesa.status}
                        </div>

                        {mesa.clienteNomeTemporario && (
                            <div className="flex flex-col items-center gap-0.5 mt-1">
                                <div className="flex items-center gap-1 text-[11px] text-gray-800 font-bold truncate max-w-full">
                                    <User size={10} /> {mesa.clienteNomeTemporario}
                                </div>
                                {mesa.dataAbertura && (
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                        ⏱ {duration}min
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {mesa.status !== 'Livre' && (
                             <div className="mt-1 w-full border-t pt-1 border-gray-200">
                                <span className="text-xs font-bold text-gray-700">
                                    {formatCurrency(total)}
                                </span>
                             </div>
                        )}

                        {mesa.status !== 'Livre' && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleLiberarMesa(mesa); }}
                                className="absolute top-1 right-1 text-red-400 hover:text-red-700 p-0.5 bg-white/50 rounded-full hover:bg-white"
                                title="Liberar Mesa"
                              >
                                <XCircle size={14} />
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

      {/* ═══════════════ Pedidos Ativos - Lista ═══════════════ */}
      {mesasOcupadas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat size={20} className="text-orange-600" />
              <h2 className="text-lg font-bold text-gray-800">Pedidos Ativos nas Mesas</h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{mesasOcupadas.length}</span>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} /> Atualiza a cada 10s
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">Mesa</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Funcionário</div>
            <div className="col-span-2">Cliente</div>
            <div className="col-span-1 text-center">Itens</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1 text-center">Tempo</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {/* Table Rows */}
          {mesasOcupadas
            .sort((a, b) => getWaitTime(b) - getWaitTime(a))
            .map(mesa => {
              const waitMinutes = getWaitTime(mesa);
              const total = getTotal(mesa);
              const itemCount = mesa.pedidoAtual?.sacola?.length || 0;
              const funcionarioNome = mesa.pedidoAtual?.funcionario?.nome;
              const waitColorClass = getWaitColor(waitMinutes);

              return (
                <div 
                  key={mesa.id} 
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b last:border-b-0 hover:bg-gray-50/80 transition-colors items-center"
                >
                  {/* Mesa Number */}
                  <div className="col-span-1">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-700 font-bold text-lg">
                      {mesa.numero}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      {mesa.pedidoAtual?.status || 'Aberto'}
                    </span>
                  </div>

                  {/* Funcionário */}
                  <div className="col-span-2">
                    {funcionarioNome ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {funcionarioNome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 font-medium truncate">{funcionarioNome}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sem funcionário</span>
                    )}
                  </div>

                  {/* Cliente */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700 truncate">{mesa.clienteNomeTemporario || 'Cliente'}</span>
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="col-span-1 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                      {itemCount}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="col-span-1 text-right">
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(total)}</span>
                  </div>

                  {/* Tempo de Espera */}
                  <div className="col-span-1 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${waitColorClass}`}>
                      <Clock size={12} />
                      {waitMinutes < 60 ? `${waitMinutes}m` : `${Math.floor(waitMinutes / 60)}h${waitMinutes % 60}m`}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="col-span-2 flex justify-end gap-2">
                    <button 
                      onClick={() => setDetailMesa(mesa)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      title="Ver Detalhes"
                    >
                      <Eye size={14} /> Detalhes
                    </button>
                    <button 
                      onClick={() => handleLiberarMesa(mesa)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      title="Liberar Mesa"
                    >
                      <Unlock size={14} /> Liberar
                    </button>
                  </div>
                </div>
              );
          })}
        </div>
      )}

      {/* ═══════════════ Modal Abrir Mesa ═══════════════ */}
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

      {/* ═══════════════ Modal Detalhes da Mesa ═══════════════ */}
      {detailMesa && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailMesa(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Mesa {detailMesa.numero}</h3>
                      <p className="text-sm text-gray-500">{detailMesa.nome || ''}</p>
                    </div>
                    <button onClick={() => setDetailMesa(null)} className="text-gray-400 hover:text-gray-700 p-1">
                      <XCircle size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Cliente</div>
                      <div className="font-bold text-gray-800">{detailMesa.clienteNomeTemporario || 'Não informado'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Funcionário</div>
                      <div className="font-bold text-gray-800">{detailMesa.pedidoAtual?.funcionario?.nome || 'Não registrado'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Tempo</div>
                      <div className="font-bold text-gray-800">{getWaitTime(detailMesa)} min</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 relative">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                      <div className="font-bold text-sm flex items-center justify-between">
                          <span className={`${
                            detailMesa.status === 'Pagamento' ? 'text-orange-600' : 
                            detailMesa.status === 'Chamando' ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {detailMesa.status}
                          </span>
                      </div>
                      
                      {/* Dropdown to change status */}
                      <select 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        value={detailMesa.status}
                        onChange={async (e) => {
                             const newStatus = e.target.value;
                             try {
                                 await atualizarStatusMesa(detailMesa.id, newStatus);
                                 fetchMesas();
                                 setDetailMesa({...detailMesa, status: newStatus});
                             } catch {
                                 alert('Erro ao atualizar status');
                             }
                        }}
                      >
                          <option value="Livre">Livre</option>
                          <option value="Ocupada">Ocupada</option>
                          <option value="Pagamento">Pagamento</option>
                          <option value="Chamando">Chamando</option>
                          <option value="Cozinha">Cozinha/Atendimento</option>
                      </select>
                    </div>
                  </div>

                  {/* Itens do Pedido (Editáveis) */}
                  {detailMesa.pedidoAtual?.sacola && detailMesa.pedidoAtual.sacola.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Itens do Pedido</h4>
                      <div className="bg-gray-50 rounded-lg divide-y max-h-52 overflow-y-auto">
                        {detailMesa.pedidoAtual.sacola.map((item) => {
                          const itemPrice = item.precoVenda;
                          const isCombo = !!item.comboId;
                          const itemName = isCombo 
                            ? (item.combo?.nome || item.nomeProduto || 'Combo')
                            : (item.nomeProduto || item.produtoLoja?.produto?.nome || 'Item');
                          return (
                            <div key={item.id} className="px-3 py-2.5 text-sm group">
                              <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                  {isCombo && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold mr-1.5">🎁 Combo</span>}
                                  
                                  {/* Status Toggle */}
                                  <button 
                                    onClick={async () => {
                                        const nextStatus = item.status === 'Pendente' ? 'Preparando' 
                                            : item.status === 'Preparando' ? 'Entregue' 
                                            : 'Pendente';
                                        
                                        try {
                                            await atualizarStatusItem(item.id, nextStatus);
                                            // Optimistic update or refresh
                                            await fetchMesas();
                                            const updatedMesas = await listarMesas(activeLoja!.id);
                                            const updated = updatedMesas.find(m => m.id === detailMesa.id);
                                            if (updated) setDetailMesa(updated);
                                        } catch {
                                            alert('Erro ao atualizar status');
                                        }
                                    }}
                                    className={`
                                        inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mr-2 border transition-colors
                                        ${!item.status || item.status === 'Pendente' ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' : ''}
                                        ${item.status === 'Preparando' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' : ''}
                                        ${item.status === 'Entregue' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : ''}
                                    `}
                                    title="Clique para alterar status"
                                  >
                                      {!item.status || item.status === 'Pendente' ? <Clock size={10} /> : 
                                       item.status === 'Preparando' ? <ChefHat size={10} /> : <CheckCircle size={10} />}
                                      {item.status || 'Pendente'}
                                  </button>

                                  <span className="font-medium text-gray-800">{itemName}</span>
                                  <span className="text-gray-500 ml-2">x{item.quantidade}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-700">
                                    {formatCurrency(itemPrice * item.quantidade)}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Remover "${itemName}" do pedido?`)) return;
                                      try {
                                        setEditLoading(true);
                                        await removerItemPedido(item.id);
                                        await fetchMesas();
                                        const updatedMesas = await listarMesas(activeLoja!.id);
                                        const updated = updatedMesas.find(m => m.id === detailMesa.id);
                                        if (updated) setDetailMesa(updated);
                                      } catch {
                                        alert('Erro ao remover item');
                                      } finally {
                                        setEditLoading(false);
                                      }
                                    }}
                                    disabled={editLoading}
                                    className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remover item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              {/* Combo sub-items */}
                              {isCombo && item.combo?.itens && item.combo.itens.length > 0 && (
                                <div className="mt-1.5 ml-4 space-y-0.5">
                                  {item.combo.itens.map((ci) => (
                                    <div key={ci.id} className="text-xs text-gray-500 flex items-center gap-1">
                                      <span className="text-gray-300">•</span>
                                      <span>{ci.produtoLoja?.produto?.nome || `Produto #${ci.produtoLojaId}`}</span>
                                      {ci.quantidade > 1 && <span className="text-gray-400">x{ci.quantidade}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {detailMesa.pedidoAtual?.sacola?.length === 0 && (
                    <div className="mb-4 text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-lg">
                      Nenhum item no pedido
                    </div>
                  )}

                  {/* Adicionar Item */}
                  {detailMesa.pedidoAtual && (
                    <div className="mb-4">
                      {!showAddItem ? (
                        <button
                          onClick={() => setShowAddItem(true)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
                        >
                          <Plus size={16} /> Adicionar Item
                        </button>
                      ) : (
                        <div className="border rounded-lg p-3 bg-blue-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-700">Adicionar Produto</h4>
                            <button onClick={() => setShowAddItem(false)} className="text-gray-400 hover:text-gray-700">
                              <XCircle size={16} />
                            </button>
                          </div>
                          <div className="relative mb-2">
                            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                            <input
                              type="text"
                              value={searchProduto}
                              onChange={e => setSearchProduto(e.target.value)}
                              placeholder="Buscar produto..."
                              className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto divide-y bg-white rounded-lg border">
                            {produtosLoja
                              .filter(p => p.nome.toLowerCase().includes(searchProduto.toLowerCase()))
                              .map(produto => (
                                <div key={produto.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-sm">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-gray-800 truncate">{produto.nome}</span>
                                    <span className="text-gray-500 ml-2 text-xs">{formatCurrency(produto.preco)}</span>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      if (!detailMesa.pedidoAtual) return;
                                      try {
                                        setEditLoading(true);
                                        await adicionarItemPedido(detailMesa.pedidoAtual.id, produto.id);
                                        await fetchMesas();
                                        const updatedMesas = await listarMesas(activeLoja!.id);
                                        const updated = updatedMesas.find(m => m.id === detailMesa.id);
                                        if (updated) setDetailMesa(updated);
                                      } catch {
                                        alert('Erro ao adicionar item');
                                      } finally {
                                        setEditLoading(false);
                                      }
                                    }}
                                    disabled={editLoading}
                                    className="ml-2 p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors shrink-0"
                                    title="Adicionar"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ))}
                            {produtosLoja.filter(p => p.nome.toLowerCase().includes(searchProduto.toLowerCase())).length === 0 && (
                              <div className="px-3 py-4 text-center text-gray-400 text-sm">Nenhum produto encontrado</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumo Financeiro */}
                  <div className="mb-4 bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatCurrency(getTotal(detailMesa))}</span>
                    </div>
                    
                    {/* Desconto */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-1"><Percent size={12} /> Desconto</span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-medium">
                          {detailMesa.pedidoAtual?.desconto ? `- ${formatCurrency(detailMesa.pedidoAtual.desconto)}` : 'R$ 0,00'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-2 flex justify-between text-base font-bold">
                      <span className="text-gray-800">Total Final</span>
                      <span className="text-green-700">
                        {formatCurrency(Math.max(0, getTotal(detailMesa) - (detailMesa.pedidoAtual?.desconto || 0)))}
                      </span>
                    </div>
                  </div>

                  {/* Aplicar Desconto */}
                  {detailMesa.pedidoAtual && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Aplicar Desconto (R$)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={descontoInput}
                          onChange={e => {
                            const v = e.target.value.replace(/[^0-9,]/g, '');
                            setDescontoInput(v);
                          }}
                          placeholder="Ex: 5,00"
                          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={async () => {
                            if (!detailMesa.pedidoAtual) return;
                            const parsed = parseFloat(descontoInput.replace(',', '.'));
                            if (isNaN(parsed) || parsed < 0) {
                              alert('Valor inválido.');
                              return;
                            }
                            const cents = Math.round(parsed * 100);
                            try {
                              setEditLoading(true);
                              await aplicarDesconto(detailMesa.pedidoAtual.id, cents);
                              setDescontoInput('');
                              await fetchMesas();
                              const updatedMesas = await listarMesas(activeLoja!.id);
                              const updated = updatedMesas.find(m => m.id === detailMesa.id);
                              if (updated) setDetailMesa(updated);
                            } catch {
                              alert('Erro ao aplicar desconto');
                            } finally {
                              setEditLoading(false);
                            }
                          }}
                          disabled={editLoading || !descontoInput}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <Percent size={14} /> Aplicar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => { handleLiberarMesa(detailMesa); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors"
                      disabled={editLoading}
                    >
                      <Unlock size={16} /> Liberar Mesa
                    </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
