using System;

namespace Controle.Application.DTOs
{
    public class TransacaoDTO
    {
        public Guid PedidoId { get; set; }
        public int NumeroPedido { get; set; }
        public DateTime DataHora { get; set; }
        public string NomeCliente { get; set; }
        public string Tipo { get; set; } // Venda, Estorno
        public string FormaPagamento { get; set; }
        public string Status { get; set; } // Pago, Pendente, Cancelado
        public decimal ValorTotal { get; set; }
    }
}
