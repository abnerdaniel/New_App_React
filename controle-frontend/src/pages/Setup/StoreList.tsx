import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Edit2, Plus, MapPin } from "lucide-react";

export function StoreList() {
  const { user, selectLoja } = useAuth();
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  function handleEdit(loja: any) {
    selectLoja(loja.id);
    // Passa o ID explicitamente para garantir que a edição carregue a loja correta
    navigate("/setup", { state: { lojaId: loja.id } });
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

                <button 
                    onClick={() => handleEdit(loja)} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                >
                    <Edit2 size={18} />
                    Editar / Gerenciar
                </button>
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
    </div>
  );
}
