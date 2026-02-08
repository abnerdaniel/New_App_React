import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, MapPin, DollarSign, Store, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import type { Endereco, Loja } from '../types';

export function CheckoutPage() {
  const { cliente } = useClientAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  // const [step, setStep] = useState(1); // Unused for now, single page checkout? // 1: Endereço, 2: Pagamento
  const [loading, setLoading] = useState(false);

  // Endereço
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [selectedEndereco, setSelectedEndereco] = useState<number | null>(null);
  const [novoEndereco, setNovoEndereco] = useState({
    apelido: '', destinatario: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: ''
  });
  const [showNovoEndereco, setShowNovoEndereco] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // Tipo de Entrega
  const [isRetirada, setIsRetirada] = useState(false);
  const [lojaData, setLojaData] = useState<Loja | null>(null);

  useEffect(() => {
      const fetchLoja = async () => {
          if (items.length > 0) {
              try {
                  const lojaId = items[0].produto.lojaId;
                  const response = await api.get(`/loja/${lojaId}`);
                  setLojaData(response.data);
              } catch (error) {
                  console.error("Erro ao buscar dados da loja", error);
              }
          }
      };
      fetchLoja();
  }, [items]);

  // Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (cliente) {
      loadEnderecos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente]);

  const loadEnderecos = async (selectNewest = false) => {
    try {
      const response = await api.get(`/clientes/${cliente?.id}/enderecos`);
      setEnderecos(response.data);
      
      if (response.data.length > 0) {
        if (selectNewest) {
          // Selecionar o endereço com maior ID (mais recente)
          const newest = response.data.reduce((prev: Endereco, current: Endereco) => 
            (prev.id > current.id) ? prev : current
          );
          setSelectedEndereco(newest.id);
        } else if (!selectedEndereco) {
          // Selecionar o primeiro se nenhum estiver selecionado
          setSelectedEndereco(response.data[0].id);
        }
      } else {
        setShowNovoEndereco(true);
      }
    } catch (error) {
      console.error("Erro ao carregar endereços", error);
    }
  };

  const handleCepChange = async (cep: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Atualiza o estado com o CEP formatado
    setNovoEndereco({ ...novoEndereco, cep: cepLimpo });

    // Se o CEP tiver 8 dígitos, busca os dados
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setNovoEndereco({
            ...novoEndereco,
            cep: cepLimpo,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          });
        } else {
          alert('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Tente novamente.');
      }
    }
  };

  const handleSalvarEndereco = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAddressId) {
          await api.put(`/clientes/${cliente?.id}/enderecos/${editingAddressId}`, {
              ...novoEndereco,
              id: editingAddressId
          });
      } else {
          await api.post(`/clientes/${cliente?.id}/enderecos`, novoEndereco);
      }
      
      await loadEnderecos(true); // Recarrega e seleciona o novo/editado
      setShowNovoEndereco(false);
      setEditingAddressId(null);
      setNovoEndereco({ apelido: '', destinatario: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: '' });
    } catch {
      alert('Erro ao salvar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (endereco: Endereco) => {
      setNovoEndereco({
          apelido: endereco.apelido || '',
          destinatario: endereco.destinatario || '',
          logradouro: endereco.logradouro || '',
          numero: endereco.numero || '',
          bairro: endereco.bairro || '',
          cidade: endereco.cidade || '',
          estado: endereco.estado || '',
          cep: endereco.cep || '',
          complemento: endereco.complemento || ''
      });
      setEditingAddressId(endereco.id);
      setShowNovoEndereco(true);
  };

  const handleDeleteAddress = async (enderecoId: number) => {
      if (!confirm("Tem certeza que deseja remover este endereço?")) return;
      try {
          await api.delete(`/clientes/${cliente?.id}/enderecos/${enderecoId}`);
          loadEnderecos();
      } catch (error) {
          console.error(error);
          alert("Erro ao remover endereço.");
      }
  };

  const handleFinalizarPedido = async () => {
    if (!isRetirada && !selectedEndereco) {
        alert('Selecione um endereço de entrega ou escolha Retirada.');
        return;
    }

    try {
        setLoading(true);
        // Montar DTO de pedido (backend precisa de ajuste para aceitar detalhes de pagamento ou salvar como obs)
        const pedidoDto = {
            lojaId: items[0].produto.lojaId, // Assume todos da mesma loja
            clienteId: cliente?.id,
            enderecoEntregaId: isRetirada ? null : selectedEndereco,
            isRetirada: isRetirada,
            itens: items.map(item => ({
                idProduto: item.produto.id,
                qtd: item.quantidade,
                adicionaisIds: item.extras ? item.extras.map(e => parseInt(e.id)) : [] // Mapping extras IDs
            })),
            metodoPagamento: metodoPagamento,
            trocoPara: metodoPagamento === 'dinheiro' && trocoPara ? parseFloat(trocoPara.replace(',', '.')) : null,
            observacao: observacao
        };

        const response = await api.post('/pedidos', pedidoDto);
        
        clearCart();
        navigate(`/pedido-sucesso/${response.data.id}`);
    } catch (error) {
        console.error(error);
        alert('Erro ao realizar pedido.');
    } finally {
        setLoading(false);
    }
  };

  if (!cliente) return <div>Acesso negado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       <div className="bg-white shadow p-4 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Finalizar Pedido</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Etapa 1: Endereço */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="font-bold flex items-center gap-2 mb-4">
                {isRetirada ? <Store className="text-green-600" size={20} /> : <MapPin className="text-green-600" size={20} />}
                {isRetirada ? 'Retirada na Loja' : 'Endereço de Entrega'}
            </h2>

            {/* Toggle Tipo Entrega */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button 
                    onClick={() => setIsRetirada(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isRetirada ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                >
                    Entrega
                </button>
                <button 
                    onClick={() => setIsRetirada(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isRetirada ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                >
                    Retirada
                </button>
            </div>

            {isRetirada ? (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm text-center">
                    <p className="font-bold">Retirar em:</p>
                    {lojaData ? (
                        <>
                            <p>{lojaData.logradouro}, {lojaData.numero}</p>
                            <p>{lojaData.bairro} - {lojaData.cidade}/{lojaData.estado}</p>
                        </>
                    ) : (
                         <p>Carregando endereço da loja...</p>
                    )}
                </div>
            ) : (
                !showNovoEndereco && enderecos.length > 0 ? (
                <div className="space-y-3">
                    {enderecos.map(end => (
                        <div 
                            key={end.id} 
                            onClick={() => setSelectedEndereco(end.id)}
                            className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${
                                selectedEndereco === end.id ? 'border-green-600 bg-red-50' : 'border-gray-200'
                            }`}
                        >
                            <div>
                                {end.apelido && <p className="font-bold text-sm text-green-600 mb-1">{end.apelido}</p>}
                                <p className="font-medium text-sm">{end.logradouro}, {end.numero}</p>
                                <p className="text-xs text-gray-500">{end.bairro} - {end.cidade}/{end.estado}</p>
                                {end.destinatario && <p className="text-xs text-gray-400 mt-1">Receber: {end.destinatario}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleEditAddress(end); }} className="p-1 hover:bg-gray-100 rounded text-blue-600">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(end.id); }} className="p-1 hover:bg-gray-100 rounded text-red-600">
                                    <Trash2 size={16} />
                                </button>
                                {selectedEndereco === end.id && <div className="w-4 h-4 bg-green-600 rounded-full shrink-0" />}
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => { setEditingAddressId(null); setShowNovoEndereco(true); setNovoEndereco({ apelido: '', destinatario: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: '' }); }}
                        className="text-green-600 text-sm font-medium mt-2 w-full text-center hover:underline"
                    >
                        + Adicionar novo endereço
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSalvarEndereco} className="space-y-3">
                     <input 
                       placeholder="Apelido (ex: Casa, Trabalho)" 
                       className="w-full p-2 border rounded" 
                       value={novoEndereco.apelido} 
                       onChange={e => setNovoEndereco({...novoEndereco, apelido: e.target.value})}
                     />
                     <input 
                       placeholder="Nome de quem vai receber" 
                       className="w-full p-2 border rounded" 
                       value={novoEndereco.destinatario} 
                       onChange={e => setNovoEndereco({...novoEndereco, destinatario: e.target.value})}
                     />
                     <input 
                       placeholder="CEP" 
                       className="w-full p-2 border rounded" 
                       value={novoEndereco.cep} 
                       onChange={e => handleCepChange(e.target.value)}
                       maxLength={8}
                     />
                     <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Rua" className="col-span-2 w-full p-2 border rounded" value={novoEndereco.logradouro} onChange={e => setNovoEndereco({...novoEndereco, logradouro: e.target.value})} />
                         <input placeholder="Numero" className="w-full p-2 border rounded" value={novoEndereco.numero} onChange={e => setNovoEndereco({...novoEndereco, numero: e.target.value})} />
                     </div>
                     <input placeholder="Complemento" className="w-full p-2 border rounded" value={novoEndereco.complemento} onChange={e => setNovoEndereco({...novoEndereco, complemento: e.target.value})} />
                     <input placeholder="Bairro" className="w-full p-2 border rounded" value={novoEndereco.bairro} onChange={e => setNovoEndereco({...novoEndereco, bairro: e.target.value})} />
                     <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Cidade" className="col-span-2 w-full p-2 border rounded" value={novoEndereco.cidade} onChange={e => setNovoEndereco({...novoEndereco, cidade: e.target.value})} />
                         <input placeholder="UF" className="w-full p-2 border rounded" value={novoEndereco.estado} onChange={e => setNovoEndereco({...novoEndereco, estado: e.target.value})} />
                     </div>
                     <div className="flex gap-2 pt-2">
                        {enderecos.length > 0 && (
                            <button type="button" onClick={() => { setShowNovoEndereco(false); setEditingAddressId(null); }} className="px-4 py-2 text-gray-600">Cancelar</button>
                        )}
                        <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 shadow transition-all">Salvar e Usar Endereço</button>
                     </div>
                </form>
            )
            )}
        </div>

        {/* Etapa 2: Pagamento */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="font-bold flex items-center gap-2 mb-4">
                <DollarSign className="text-green-600" size={20} />
                Forma de Pagamento
            </h2>
            
            <div className="space-y-2">
                {['pix', 'dinheiro', 'cartao_credito', 'cartao_debito'].map(metodo => (
                    <label key={metodo} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                            type="radio" 
                            name="pagamento" 
                            value={metodo} 
                            checked={metodoPagamento === metodo}
                            onChange={(e) => setMetodoPagamento(e.target.value)}
                            className="text-green-600 focus:ring-green-600"
                        />
                        <span className="capitalize">{metodo.replace('_', ' ')}</span>
                    </label>
                ))}
            </div>

            {metodoPagamento === 'dinheiro' && (
                <div className="mt-3">
                    <label className="text-sm font-medium text-gray-700">Troco para quanto?</label>
                    <input 
                        type="text" 
                        placeholder="Ex: 50,00" 
                        className="w-full p-2 border rounded mt-1"
                        value={trocoPara}
                        onChange={(e) => setTrocoPara(e.target.value)}
                    />
                </div>
            )}

            <div className="mt-4 border-t pt-4">
               <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                 Observação 
                 <span className="text-xs text-gray-400 font-normal">(Opcional)</span>
               </label>
               <textarea
                 className="w-full p-2 border rounded mt-1 text-sm h-20 resize-none"
                 placeholder="Ex: Tocar campainha, retirar cebola, etc."
                 value={observacao}
                 onChange={(e) => setObservacao(e.target.value)}
               />
            </div>
        </div>

        {/* Resumo */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
            <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-gray-600">
                <span>Taxa de Entrega</span>
                <span>{isRetirada ? 'Grátis' : 'R$ 5,00'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>R$ {(total + (isRetirada ? 0 : 5)).toFixed(2)}</span>
            </div>
        </div>

        <button 
            onClick={handleFinalizarPedido}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg  active:scale-95 transition-all"
        >
            {loading ? 'Enviando...' : 'Confirmar Pedido'}
        </button>
      </div>
    </div>
  );
}
