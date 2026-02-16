using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class PedidoItem
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int? ProdutoLojaId { get; set; } // O produto original (Pode ser null se for um Combo)
    public virtual ProdutoLoja? ProdutoLoja { get; set; } // Navigation Property
    public string NomeProduto { get; set; } = string.Empty; // Salva o nome (caso o original mude)
    public int PrecoVenda { get; set; } // O PREÇO QUE FOI PAGO (R$ 20,00)
    public int Quantidade { get; set; }
    
    public int? ComboId { get; set; } // Se o item for um combo
    public Combo? Combo { get; set; }

    public string Status { get; set; } = "Pendente"; // Pendente, Preparando, Entregue, Cancelado

    public ICollection<PedidoItemAdicional> Adicionais { get; set; } = new List<PedidoItemAdicional>();
}