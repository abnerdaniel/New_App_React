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

    public int? ParentPedidoItemId { get; set; } // Referência para o Item Pai (Cabeçalho do Combo)
    public PedidoItem? ParentPedidoItem { get; set; } // Navegação para o Pai
    public ICollection<PedidoItem> SubItens { get; set; } = new List<PedidoItem>(); // Lista de Itens do Combo

    public string Status { get; set; } = "Pendente"; // Pendente, Preparando, Entregue, Cancelado
    public int? ProdutoVarianteId { get; set; } // Variante de varejo selecionada (SKU composto)
    public ICollection<PedidoItemAdicional> Adicionais { get; set; } = new List<PedidoItemAdicional>();
    public ICollection<PedidoItemOpcao> Opcoes { get; set; } = new List<PedidoItemOpcao>(); // Opções de produto configurável
}