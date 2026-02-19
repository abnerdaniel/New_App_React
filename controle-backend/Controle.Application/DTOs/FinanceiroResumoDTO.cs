using System;
using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class FinanceiroResumoDTO
    {
        // KPIs
        public decimal FaturamentoBruto { get; set; }
        public decimal TaxasEntrega { get; set; }
        public decimal TotalDescontos { get; set; }
        public decimal FaturamentoLiquido { get; set; }
        public decimal TicketMedio { get; set; }
        public int TotalPedidos { get; set; }

        // Gráficos
        public List<GraficoVendasDiaDTO> EvolucaoDiaria { get; set; } = new List<GraficoVendasDiaDTO>();
        public List<GraficoPagamentoDTO> MeiosPagamento { get; set; } = new List<GraficoPagamentoDTO>();
    }

    public class GraficoVendasDiaDTO
    {
        public DateTime Data { get; set; }
        public decimal Valor { get; set; }
        public int Quantidade { get; set; }
    }

    public class GraficoPagamentoDTO
    {
        public string Metodo { get; set; }
        public decimal Valor { get; set; }
        public int Quantidade { get; set; }
    }
}
