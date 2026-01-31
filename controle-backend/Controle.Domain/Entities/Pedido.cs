using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Pedido
{
    public int Id { get; set; }
    public Guid LojaId { get; set; } // Loja que vendeu
    public int? NumeroFila { get; set; } // Numero da Fila
    public int? NumeroMesa { get; set; } // Numero do Mesa
    public int? GarcomId { get; set; } // Garcom que atendeu
    public int? AtendenteId { get; set; } // Atendente que atendeu
    public int ClienteId { get; set; } // Cliente Final
    public string? Descricao { get; set; } // Descricao do Pedido
    public int? EnderecoDeEntregaId { get; set; } // Endereco do Cliente Final
    public DateTime DataVenda { get; set; } // Data do Pedido
    public int? ValorTotal { get; set; } // Valor Total do Pedido
    public int? Desconto { get; set; } // Desconto do Pedido
    public string? Status { get; set; } // Status do Pedido
    public int Quantidade { get; set; } // Quantidade do Pedido
    public List<PedidoItem> Sacola { get; set; } = new List<PedidoItem>(); // itens do Pedido
}
   