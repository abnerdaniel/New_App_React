import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/axios";
import { format, subDays, startOfMonth, startOfToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    Calendar, DollarSign, TrendingUp, CreditCard, 
    Download, ShoppingBag, Bike 
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from "recharts";
import type { FinanceiroResumo, Transacao } from "../../types/Financeiro";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function FinanceiroPage() {
    const { activeLoja } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Date State
    const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
        start: startOfToday(),
        end: startOfToday()
    });
    const [rangeLabel, setRangeLabel] = useState("Hoje");

    // Data State
    const [resumo, setResumo] = useState<FinanceiroResumo | null>(null);
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);

    useEffect(() => {
        if (activeLoja?.id) {
            loadData();
        }
    }, [activeLoja, dateRange]);

    const loadData = async () => {
        if (!activeLoja?.id) return;
        setLoading(true);
        try {
            const params = {
                inicio: dateRange.start.toISOString(),
                fim: dateRange.end.toISOString()
            };

            const [resResumo, resTransacoes] = await Promise.all([
                api.get<FinanceiroResumo>(`/api/dashboard/loja/${activeLoja.id}/financeiro`, { params }),
                api.get<Transacao[]>(`/api/dashboard/loja/${activeLoja.id}/transacoes`, { params })
            ]);

            setResumo(resResumo.data);
            setTransacoes(resTransacoes.data);
        } catch (error) {
            console.error("Erro ao carregar dados financeiros", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePresetChange = (preset: string) => {
        const hoje = startOfToday();
        setRangeLabel(preset);
        
        switch (preset) {
            case "Hoje":
                setDateRange({ start: hoje, end: hoje });
                break;
            case "Ontem":
                const ontem = subDays(hoje, 1);
                setDateRange({ start: ontem, end: ontem });
                break;
            case "Últimos 7 dias":
                setDateRange({ start: subDays(hoje, 6), end: hoje });
                break;
            case "Últimos 30 dias":
                setDateRange({ start: subDays(hoje, 29), end: hoje });
                break;
            case "Este Mês":
                setDateRange({ start: startOfMonth(hoje), end: hoje });
                break;
        }
    };

    const formatCurrency = (val: number) => 
        val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="text-brand-primary" />
                        Faturamento e Relatórios
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Análise financeira da loja {activeLoja?.nome}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias", "Este Mês"].map(label => (
                        <button
                            key={label}
                            onClick={() => handlePresetChange(label)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeLabel === label ? 'bg-brand-primary text-white font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {label}
                        </button>
                    ))}
                    <div className="h-4 w-px bg-gray-300 mx-1 hidden md:block"></div>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-brand-primary font-medium">
                        <Calendar size={14} />
                        Personalizado
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md font-medium ml-2 border border-transparent hover:border-green-200">
                        <Download size={14} />
                        Exportar
                    </button>
                </div>
            </div>

            {loading && !resumo ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            ) : resumo && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Faturamento Bruto</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumo.faturamentoBruto)}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{resumo.totalPedidos} pedidos concluídos</p>
                                </div>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShoppingBag size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Faturamento Líquido</p>
                                    <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(resumo.faturamentoLiquido)}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Bruto - Descontos - Taxas</p>
                                </div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Ticket Médio</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumo.ticketMedio)}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Por pedido</p>
                                </div>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <DollarSign size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Taxas de Entrega</p>
                                    <h3 className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(resumo.taxasEntrega)}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Repasse para motoboys</p>
                                </div>
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <Bike size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-brand-primary" />
                                Evolução de Vendas
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={resumo.evolucaoDiaria}>
                                        <defs>
                                            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EA1D2C" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#EA1D2C" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis 
                                            dataKey="data" 
                                            tickFormatter={(str) => format(parseISO(str), 'dd/MM', { locale: ptBR })}
                                            stroke="#9CA3AF"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            stroke="#9CA3AF"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `R$ ${val}`}
                                        />
                                        <Tooltip 
                                            formatter={(value: any) => [`R$ ${value ? value.toFixed(2) : '0.00'}`, "Vendas"]}
                                            labelFormatter={(str) => format(parseISO(str as string), 'dd ' + "de" + ' MMMM', { locale: ptBR })}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="valor" 
                                            stroke="#EA1D2C" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorValor)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <CreditCard size={18} className="text-blue-600" />
                                Meios de Pagamento
                            </h3>
                            <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={resumo.meiosPagamento}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="valor"
                                        >
                                            {resumo.meiosPagamento.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: any) => formatCurrency(val || 0)} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                             <h3 className="font-bold text-gray-800">Extrato Detalhado</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Data/Hora</th>
                                        <th className="px-6 py-3">Pedido</th>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Pagamento</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transacoes.map((t) => (
                                        <tr key={t.numeroPedido} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {format(parseISO(t.dataHora), 'dd/MM/yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-brand-primary">
                                                #{t.numeroPedido}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                                {t.nomeCliente}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1.5">
                                                    <CreditCard size={14} className="text-gray-400" />
                                                    {t.formaPagamento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${t.status === 'Concluido' ? 'bg-green-100 text-green-800' : 
                                                      t.status === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold text-right ${
                                                t.status === 'Cancelado' ? 'text-gray-400 line-through' : 'text-green-600'
                                            }`}>
                                                {formatCurrency(t.valorTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {transacoes.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Nenhuma transação encontrada neste período.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
