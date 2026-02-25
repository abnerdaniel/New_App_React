import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Edit2, Plus, MapPin, Trash2, AlertTriangle } from "lucide-react";

export function StoreList() {
  const { user, selectLoja } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lojas, setLojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [storeToDelete, setStoreToDelete] = useState<any | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLojas = useCallback(async () => {
    try {
      if (user?.id) {
        const response = await api.get(`/api/loja/usuario/${user.id}`);
        setLojas(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadLojas();
    }
  }, [user, loadLojas]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEdit(loja: any) {
    selectLoja(loja.id);
    // Passa o ID explicitamente para garantir que a edição carregue a loja correta
    navigate("/setup", { state: { lojaId: loja.id } });
  }

  async function handleDeleteConfirm() {
    if (!storeToDelete || confirmText !== storeToDelete.nome) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/api/loja/${storeToDelete.id}`);
      
      // Remove da lista atual
      setLojas(prev => prev.filter(l => l.id !== storeToDelete.id));
      
      // Limpa estado
      setStoreToDelete(null);
      setConfirmText("");
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      alert("Erro ao excluir a loja. Verifique se você tem permissão ou se há erros no sistema.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Minhas Lojas</h2>
           <p className="text-gray-500">Gerencie seus estabelecimentos</p>
        </div>
        <button 
            onClick={() => navigate('/setup', { state: { mode: 'create' } })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
        >
            <Plus size={20} />
            Nova Loja
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lojas.map(loja => (
            <div key={loja.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col gap-2 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 break-words">{loja.nome}</h3>
                    <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${loja.abertaManualmente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {loja.abertaManualmente ? 'ABERTA' : 'FECHADA'}
                        </span>
                    </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{loja.cidade} - {loja.estado}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500 text-xs">CNPJ:</span>
                        <span>{loja.cpfCnpj}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => handleEdit(loja)} 
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                        <Edit2 size={18} />
                        Editar / Gerenciar
                    </button>
                    <button 
                        onClick={() => { setStoreToDelete(loja); setConfirmText(""); }}
                        className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-100"
                        title="Excluir Loja"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
              </div>
            </div>
          ))}
          
          {lojas.length === 0 && (
             <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900">Nenhuma loja encontrada</h3>
                <p className="text-gray-500 mt-1">Clique em "Nova Loja" para começar.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal de Exclusão */}
      {storeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Excluir Loja?</h3>
                      <p className="text-gray-600 mb-6">
                          Você está prestes a excluir permanentemente a loja <strong className="text-gray-900">{storeToDelete.nome}</strong>. Esta ação não pode ser desfeita e excluirá todos os produtos, categorias e funcionários vinculados.
                      </p>
                  </div>
                  
                  <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Digite <strong>{storeToDelete.nome}</strong> para confirmar:
                      </label>
                      <input 
                          type="text" 
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                          placeholder={storeToDelete.nome}
                      />
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                          onClick={() => { setStoreToDelete(null); setConfirmText(""); }}
                          className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={handleDeleteConfirm}
                          disabled={confirmText !== storeToDelete.nome || isDeleting}
                          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                      >
                          {isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
