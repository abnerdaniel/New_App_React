import { AlertOctagon, Clock, AlertTriangle } from 'lucide-react';

interface Alerta {
    tipo: string;
    mensagem: string;
    nivel: string;
    entidadeId?: number;
}

interface CriticalAlertsProps {
    alertas: Alerta[];
}

export function CriticalAlerts({ alertas }: CriticalAlertsProps) {
    // Se não houver alertas, não mostra nada (ou mostra mensagem de "Tudo OK")
    if (!alertas || alertas.length === 0) {
        return (
            <div className="bg-green-50 rounded-xl border border-green-100 p-4 mb-6 flex items-center justify-center gap-2 text-green-700">
                <span className="font-bold">✨ Tudo tranquilo por aqui!</span> Sem alertas críticos.
            </div>
        );
    }

    return (
        <div className="bg-red-50 rounded-xl border border-red-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <AlertOctagon className="text-red-600" />
                Alertas Críticos
            </h3>

            <div className="space-y-3">
                {alertas.map((alerta, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500 flex items-start gap-3">
                        <div className="mt-0.5">
                            {alerta.tipo === 'Atraso' ? (
                                <Clock size={20} className="text-red-500" />
                            ) : (
                                <AlertTriangle size={20} className="text-orange-500" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{alerta.tipo === 'Atraso' ? 'Pedido Atrasado' : 'Estoque Baixo'}</p>
                            <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
