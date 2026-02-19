export interface GraficoVendasDia {
    data: string;
    valor: number;
    quantidade: number;
}

export interface GraficoPagamento {
    metodo: string;
    valor: number;
    quantidade: number;
}

export interface FinanceiroResumo {
    faturamentoBruto: number;
    taxasEntrega: number;
    totalDescontos: number;
    faturamentoLiquido: number;
    ticketMedio: number;
    totalPedidos: number;
    evolucaoDiaria: GraficoVendasDia[];
    meiosPagamento: GraficoPagamento[];
}

export interface Transacao {
    pedidoId: string;
    numeroPedido: number;
    dataHora: string;
    nomeCliente: string;
    tipo: string;
    formaPagamento: string;
    status: string;
    valorTotal: number;
}
