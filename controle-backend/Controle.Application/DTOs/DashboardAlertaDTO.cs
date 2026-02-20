using System;

namespace Controle.Application.DTOs
{
    public class DashboardAlertaDTO
    {
        public string Tipo { get; set; } // "Estoque" ou "Atraso"
        public string Mensagem { get; set; }
        public string Nivel { get; set; } // "Crítico" ou "Aviso"
        public int? EntidadeId { get; set; } // Id do Produto ou Pedido
    }
}
