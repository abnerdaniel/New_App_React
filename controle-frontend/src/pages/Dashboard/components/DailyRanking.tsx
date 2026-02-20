import { Trophy } from 'lucide-react';

interface RankingItem {
    nomeProduto: string;
    quantidadeVendida: number;
    // valorTotalVendido: number; 
}

interface DailyRankingProps {
    data: RankingItem[];
}

export function DailyRanking({ data }: DailyRankingProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Top 5 Mais Vendidos Hoje
            </h3>
            
            <div className="space-y-4">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              idx === 1 ? 'bg-gray-100 text-gray-700' : 
                              idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}
                        `}>
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.nomeProduto}</p>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div 
                                    className="h-full bg-brand-primary rounded-full" 
                                    style={{ width: `${(item.quantidadeVendida / data[0].quantidadeVendida) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-gray-900">{item.quantidadeVendida}</span>
                            <span className="text-xs text-gray-400">vendas</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
