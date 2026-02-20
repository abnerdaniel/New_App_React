import { TrendingUp, ShoppingBag, DollarSign, XCircle } from 'lucide-react';

interface ShiftKPIsProps {
    data: any;
}

export function ShiftKPIs({ data }: ShiftKPIsProps) {
    if (!data) return null;

    const kpis = [
        {
            label: "Pedidos Hoje",
            value: data.totalPedidosHoje,
            sub: "novos pedidos",
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Faturação Hoje",
            value: (data.totalVendidoHoje / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            sub: "receita bruta",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Ticket Médio",
            value: (data.ticketMedio / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            sub: "por pedido",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Cancelamentos",
            value: data.pedidosCancelados,
            sub: "pedidos perdidos",
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
                        <div className={`p-2 rounded-lg ${kpi.bg}`}>
                            <kpi.icon size={18} className={kpi.color} />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-gray-800">{kpi.value}</h4>
                        <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
