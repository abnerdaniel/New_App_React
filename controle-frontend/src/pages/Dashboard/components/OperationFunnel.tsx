import { Bell, ChefHat, PackageCheck, Bike } from 'lucide-react';

interface FunnelProps {
    data: {
        novos: number;
        naCozinha: number;
        prontos: number;
        emRota: number;
    } | null;
}

export function OperationFunnel({ data }: FunnelProps) {
    if (!data) return null;

    const stages = [
        {
            id: 'novos',
            label: 'Novos / Pendentes',
            count: data.novos,
            icon: Bell,
            color: 'text-red-600',
            bg: 'bg-red-100',
            border: 'border-red-200',
            pulse: data.novos > 0
        },
        {
            id: 'cozinha',
            label: 'Na Cozinha',
            count: data.naCozinha,
            icon: ChefHat,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
            border: 'border-yellow-200',
            pulse: false
        },
        {
            id: 'prontos',
            label: 'Prontos / Aguardando',
            count: data.prontos,
            icon: PackageCheck,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-200',
            pulse: false
        },
        {
            id: 'rota',
            label: 'Em Rota',
            count: data.emRota,
            icon: Bike,
            color: 'text-green-600',
            bg: 'bg-green-100',
            border: 'border-green-200',
            pulse: false
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Pulso da Operação
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stages.map((stage) => (
                    <div key={stage.id} className={`relative overflow-hidden rounded-xl border-2 ${stage.border} p-4 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]`}>
                        {stage.pulse && (
                            <span className="absolute top-2 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                        
                        <div className={`p-3 rounded-full ${stage.bg} mb-3`}>
                            <stage.icon size={24} className={stage.color} />
                        </div>
                        <span className={`text-4xl font-extrabold ${stage.color}`}>{stage.count}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase mt-1">{stage.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
