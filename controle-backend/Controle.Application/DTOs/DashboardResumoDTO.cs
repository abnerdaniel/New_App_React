using System;

namespace Controle.Application.DTOs
{
    public class DashboardResumoDTO
    {
        public int TotalVendidoHoje { get; set; }
        public int TicketMedio { get; set; }
        public int PedidosCancelados { get; set; }
        public int TotalPedidosHoje { get; set; }
    }
}
