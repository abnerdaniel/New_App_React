using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Pedido
{
    public int Id { get; set; }
    public Guid LojaId { get; set; } // Loja que vendeu
    public Loja? Loja { get; set; } // Navigation Property
    public int? NumeroFila { get; set; } // Numero da Fila
    public int? NumeroMesa { get; set; } // Numero do Mesa
    public int? FuncionarioId { get; set; } // Funcionario que atendeu (Garçom/Atendente)
    public virtual Funcionario? Funcionario { get; set; } // Navigation Property
    public int? ClienteId { get; set; } // Cliente Final (Opcional para Mesas)
    public virtual ClienteFinal? Cliente { get; set; } // Navigation Property
    public string? Descricao { get; set; } // Descricao do Pedido
    public int? EnderecoDeEntregaId { get; set; } // Endereco do Cliente Final
    public virtual Endereco? EnderecoDeEntrega { get; set; } // Navigation Property
    public DateTime DataVenda { get; set; } // Data do Pedido
    public int? ValorTotal { get; set; } // Valor Total do Pedido
    public int? Desconto { get; set; } // Desconto do Pedido
    public string? Status { get; set; } // Status do Pedido
    public int Quantidade { get; set; } // Quantidade do Pedido
    public List<PedidoItem> Sacola { get; set; } = new List<PedidoItem>(); // itens do Pedido
    public string? MetodoPagamento { get; set; } = string.Empty;
    public decimal? TrocoPara { get; set; } // Valor para troco (se dinheiro)
    public string? Observacao { get; set; } = string.Empty;
    public bool IsRetirada { get; set; } // Retirada em loja
    public string? MotivoCancelamento { get; set; }
}
   