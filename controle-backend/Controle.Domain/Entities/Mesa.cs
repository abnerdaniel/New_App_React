using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Controle.Domain.Entities;

public class Mesa
{
    public int Id { get; set; }
    public Guid LojaId { get; set; }
    public int Numero { get; set; } // Identificador sequencial visível (1, 2, 3...)
    public string? Nome { get; set; } // Apelido (ex: "Janela")
    public string? ClienteNomeTemporario { get; set; } // Nome do cliente atual
    public string Status { get; set; } = "Livre"; // Livre, Ocupada, Pagamento
    
    public int? PedidoAtualId { get; set; }
    [ForeignKey("PedidoAtualId")]
    public virtual Pedido? PedidoAtual { get; set; }
    
    public DateTime? DataAbertura { get; set; }
}
