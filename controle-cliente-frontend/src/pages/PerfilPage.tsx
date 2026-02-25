import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { ArrowLeft, User, Phone, MapPin, Edit2, Trash2, Plus, Save } from 'lucide-react';
import { api } from '../services/api';
import type { Endereco } from '../types';

export function PerfilPage() {
  const { cliente, updateProfile, logout } = useClientAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Dados Pessoais
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  // Endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [showNovoEndereco, setShowNovoEndereco] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [novoEndereco, setNovoEndereco] = useState({
    apelido: '', destinatario: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: ''
  });

  useEffect(() => {
    if (cliente) {
        setNome(cliente.nome || '');
        setTelefone(cliente.telefone || '');
        loadEnderecos();
    } else {
        navigate('/');
    }
  }, [cliente, navigate]);

  const loadEnderecos = async () => {
    try {
      const response = await api.get(`/clientes/${cliente?.id}/enderecos`);
      setEnderecos(response.data);
    } catch (error) {
      console.error("Erro ao carregar endereços", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setSuccessMsg('');
      try {
          await updateProfile({ nome, telefone });
          setSuccessMsg('Perfil atualizado com sucesso!');
          setTimeout(() => setSuccessMsg(''), 3000);
      } catch {
          alert('Erro ao atualizar perfil.');
      } finally {
          setLoading(false);
      }
  };

  const handleCepChange = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    setNovoEndereco({ ...novoEndereco, cep: cepLimpo });

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
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
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
      
      await loadEnderecos();
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

  if (!cliente) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">Meu Perfil</h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/meus-pedidos')} className="text-brand-primary font-medium text-sm hover:underline mr-2">
                Meus Pedidos
            </button>
            <button onClick={logout} className="text-red-500 font-medium text-sm hover:underline">
                Sair
            </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        
        {/* Dados Pessoais */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User size={20} className="text-brand-primary" />
                Dados Pessoais
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input 
                        type="text" 
                        value={nome}
                        onChange={(e) => setNome(e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, ''))}
                        className="w-full p-2 border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="tel" 
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-10 p-2 border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="Apenas números"
                        />
                    </div>
                </div>
                {successMsg && <p className="text-green-600 text-sm font-medium">{successMsg}</p>}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-4 py-3 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed mt-4"
                >
                    <Save size={20} />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </form>
        </section>

        {/* Endereços */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapPin size={20} className="text-brand-primary" />
                    Meus Endereços
                </h2>
                {!showNovoEndereco && (
                    <button 
                        onClick={() => { setShowNovoEndereco(true); setEditingAddressId(null); setNovoEndereco({ apelido: '', destinatario: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', complemento: '' }); }}
                        className="text-brand-primary flex items-center gap-1 font-medium hover:underline"
                    >
                        <Plus size={18} /> Novo
                    </button>
                )}
            </div>

            {showNovoEndereco ? (
                <form onSubmit={handleSalvarEndereco} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2">{editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}</h3>
                     <input 
                       placeholder="Apelido (ex: Casa, Trabalho)" 
                       className="w-full p-2 border rounded bg-white" 
                       value={novoEndereco.apelido} 
                       onChange={e => setNovoEndereco({...novoEndereco, apelido: e.target.value.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, '')})}
                     />
                     <input 
                       placeholder="Nome de quem vai receber" 
                       className="w-full p-2 border rounded bg-white" 
                       value={novoEndereco.destinatario} 
                       onChange={e => setNovoEndereco({...novoEndereco, destinatario: e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, '')})}
                     />
                     <input 
                       placeholder="CEP" 
                       className="w-full p-2 border rounded bg-white" 
                       value={novoEndereco.cep} 
                       onChange={e => handleCepChange(e.target.value.replace(/\D/g, ''))}
                       maxLength={8}
                     />
                     <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Rua" className="col-span-2 w-full p-2 border rounded bg-white" value={novoEndereco.logradouro} onChange={e => setNovoEndereco({...novoEndereco, logradouro: e.target.value.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s,.-]/g, '')})} />
                         <input placeholder="Numero" className="w-full p-2 border rounded bg-white" value={novoEndereco.numero} onChange={e => setNovoEndereco({...novoEndereco, numero: e.target.value.replace(/[^0-9a-zA-Z-]/g, '')})} />
                     </div>
                     <input placeholder="Complemento" className="w-full p-2 border rounded bg-white" value={novoEndereco.complemento} onChange={e => setNovoEndereco({...novoEndereco, complemento: e.target.value.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s,.-]/g, '')})} />
                     <input placeholder="Bairro" className="w-full p-2 border rounded bg-white" value={novoEndereco.bairro} onChange={e => setNovoEndereco({...novoEndereco, bairro: e.target.value.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, '')})} />
                     <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Cidade" className="col-span-2 w-full p-2 border rounded bg-white" value={novoEndereco.cidade} onChange={e => setNovoEndereco({...novoEndereco, cidade: e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, '')})} />
                         <input placeholder="UF" className="w-full p-2 border rounded bg-white" value={novoEndereco.estado} onChange={e => setNovoEndereco({...novoEndereco, estado: e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase()})} maxLength={2} />
                     </div>
                     <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => { setShowNovoEndereco(false); setEditingAddressId(null); }} className="flex-1 px-4 py-2 text-gray-600 bg-white border rounded hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 shadow transition-all">Salvar</button>
                     </div>
                </form>
            ) : (
                <div className="space-y-3">
                    {enderecos.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum endereço cadastrado.</p>
                    ) : (
                        enderecos.map(end => (
                            <div key={end.id} className="p-4 border rounded-lg flex justify-between items-start hover:border-brand-primary transition-colors bg-white">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800">{end.apelido || 'Endereço'}</h4>
                                        {end.destinatario && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Receber: {end.destinatario}</span>}
                                    </div>
                                    <p className="text-sm text-gray-600">{end.logradouro}, {end.numero} {end.complemento ? ` - ${end.complemento}` : ''}</p>
                                    <p className="text-xs text-gray-500">{end.bairro} - {end.cidade}/{end.estado} - {end.cep}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditAddress(end)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Editar">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteAddress(end.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}
