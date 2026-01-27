using System;
using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class PedidoHistoricoDTO
    {
        public int Id { get; set; }
        public DateTime DataVenda { get; set; }
        public int ValorTotal { get; set; }
        public string Status { get; set; } = string.Empty;
        public int QuantidadeItens { get; set; }
        public string ResumoItens { get; set; } = string.Empty; // Ex: "2x Hamburguer, 1x Coca-Cola"
    }
}
