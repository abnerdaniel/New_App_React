import { useState } from 'react';
import { Store, Clock } from 'lucide-react';
import { api } from '../../../api/axios';

interface LojaData {
    id: string;
    abertaManualmente?: boolean | null;
    tempoMinimoEntrega?: number | null;
    tempoMaximoEntrega?: number | null;
}

interface MasterControlProps {
    loja: LojaData | null;
    onUpdate: () => void;
}

export function MasterControl({ loja, onUpdate }: MasterControlProps) {
    const [loading, setLoading] = useState(false);

    const handleToggleStore = async () => {
        if (!loja) return;
        setLoading(true);
        try {
            // Se abertaManualmente for null ou true, fechar (false). Se false, abrir (true).
            // A lógica do backend para "Aberta" considera horário também, mas aqui é override manual.
            const novoStatus = loja.abertaManualmente === false ? true : false;
            
            await api.put(`/api/lojas/${loja.id}/status`, { aberta: novoStatus });
            onUpdate();
        } catch (error) {
            console.error("Erro ao alterar status da loja", error);
            alert("Erro ao alterar status da loja");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTime = async (min: number, max: number) => {
         if (!loja) return;
         setLoading(true);
         try {
             await api.put(`/api/lojas/${loja.id}/config`, { 
                 tempoMinimoEntrega: min,
                 tempoMaximoEntrega: max
             });
             onUpdate();
         } catch (error) {
             console.error("Erro ao atualizar tempo", error);
         } finally {
             setLoading(false);
         }
    }

    if (!loja) return null;

    const isAberta = loja.abertaManualmente !== false; // Default true se null

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Status Toggle */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`p-3 rounded-full ${isAberta ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Store size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Status da Loja</h3>
                        <p className={`text-sm font-medium ${isAberta ? 'text-green-600' : 'text-red-600'}`}>
                            {isAberta ? 'ABERTA PARA PEDIDOS' : 'FECHADA TEMPORARIAMENTE'}
                        </p>
                    </div>
                    <button 
                        onClick={handleToggleStore}
                        disabled={loading}
                        className={`ml-auto md:ml-4 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                            isAberta 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                        }`}
                    >
                        {loading ? '...' : (isAberta ? 'FECHAR LOJA' : 'ABRIR LOJA')}
                    </button>
                </div>

                {/* Divider */}
                <div className="hidden md:block h-12 w-px bg-gray-200"></div>

                {/* Delivery Time Control */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Clock size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800">Tempo de Entrega</h3>
                        <div className="flex gap-2 mt-1">
                             {[30, 45, 60, 90].map(time => (
                                 <button
                                    key={time}
                                    onClick={() => handleUpdateTime(time, time + 15)}
                                    // Highlight se o tempo min atual for igual
                                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                                        loja.tempoMinimoEntrega === time 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                 >
                                    {time}-{time+15} min
                                 </button>
                             ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
