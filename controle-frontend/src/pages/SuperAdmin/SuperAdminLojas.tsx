import { useEffect, useState } from 'react';
import { ShieldAlert, Save, Lock, Unlock, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LojaAdmin {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  ativo: boolean;
  dataCriacao: string;
  licencaValidaAte: string | null;
  bloqueadaPorFaltaDePagamento: boolean;
  urlComprovantePagamento: string | null;
}

export function SuperAdminLojas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<LojaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit State
  const [editLicenca, setEditLicenca] = useState('');
  const [editBloqueada, setEditBloqueada] = useState(false);
  const [editUrl, setEditUrl] = useState('');

  const isSuperAdmin = user?.email === "abreu651@gmail.com" || user?.email === "eu@eu.com";

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard');
      return;
    }
    loadLojas();
  }, [isSuperAdmin, navigate]);

  const loadLojas = async () => {
    try {
      const res = await api.get('/api/superadmin/lojas');
      setLojas(res.data);
    } catch (error) {
      console.error("Erro ao carregar lojas", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (loja: LojaAdmin) => {
    setEditingId(loja.id);
    setEditLicenca(loja.licencaValidaAte ? loja.licencaValidaAte.split('T')[0] : '');
    setEditBloqueada(loja.bloqueadaPorFaltaDePagamento);
    setEditUrl(loja.urlComprovantePagamento || '');
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/api/superadmin/lojas/${id}/licenca`, {
        licencaValidaAte: editLicenca ? new Date(editLicenca).toISOString() : null,
        bloqueadaPorFaltaDePagamento: editBloqueada,
        urlComprovantePagamento: editUrl || null
      });
      setEditingId(null);
      loadLojas();
    } catch (error) {
      console.error("Erro ao salvar licença", error);
      alert("Erro ao salvar os dados.");
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando painel master...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <div>
             <h1 className="text-3xl font-bold text-gray-800">Gestão de Lojas (Super Admin)</h1>
             <p className="text-gray-500 text-sm">Controle de licenciamento e acessos vitais.</p>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-semibold text-gray-600">Loja</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Contato</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Vencimento Licença</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Comprovante</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lojas.map(loja => {
                const isEditing = editingId === loja.id;
                const isVencida = loja.licencaValidaAte && new Date(loja.licencaValidaAte) < new Date();

                return (
                  <tr key={loja.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{loja.nome}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{loja.id}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">{loja.email}</p>
                      <p className="text-xs text-gray-500">{loja.cpfCnpj}</p>
                    </td>
                    
                    {/* Validade */}
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={editLicenca} 
                          onChange={e => setEditLicenca(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <span className={`text-sm font-medium ${isVencida ? 'text-red-600' : 'text-gray-900'}`}>
                          {loja.licencaValidaAte ? new Date(loja.licencaValidaAte).toLocaleDateString() : 'Sem Limite'}
                        </span>
                      )}
                    </td>

                    {/* Status Bloqueio */}
                    <td className="p-4">
                      {isEditing ? (
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                               type="checkbox" 
                               checked={editBloqueada} 
                               onChange={e => setEditBloqueada(e.target.checked)}
                               className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-red-600">Bloquear Inadimplência</span>
                         </label>
                      ) : (
                         <div className="flex flex-col gap-1">
                            {loja.bloqueadaPorFaltaDePagamento ? (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                                    <Lock size={12}/> Bloqueada (Financeiro)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                    <Unlock size={12}/> Liberada
                                </span>
                            )}
                         </div>
                      )}
                    </td>

                    {/* Comprovante */}
                    <td className="p-4">
                       {isEditing ? (
                           <input 
                             type="text" 
                             placeholder="URL do Comprovante"
                             value={editUrl} 
                             onChange={e => setEditUrl(e.target.value)}
                             className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                           />
                       ) : (
                           loja.urlComprovantePagamento ? (
                               <a 
                                 href={loja.urlComprovantePagamento} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded"
                               >
                                  <ImageIcon size={14}/> Ver Comprovante
                               </a>
                           ) : (
                               <span className="text-gray-400 text-xs italic">-</span>
                           )
                       )}
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <button 
                          onClick={() => saveEdit(loja.id)}
                          className="bg-brand-primary text-white p-2 rounded hover:bg-brand-hover inline-flex items-center justify-center transition-colors shadow-sm"
                          title="Salvar"
                        >
                          <Save size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => startEdit(loja)}
                          className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 text-sm font-medium transition-colors"
                        >
                          Editar
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}

              {lojas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma loja encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
