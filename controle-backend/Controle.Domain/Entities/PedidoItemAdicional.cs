using System;

namespace Controle.Domain.Entities;

public class PedidoItemAdicional
{
    public int Id { get; set; }
    
    public int PedidoItemId { get; set; }
    public PedidoItem PedidoItem { get; set; } = null!;

    public int PrecoAdicional { get; set; } // Depreciado, mas mantido. Usaremos PrecoUnitario no novo código
    public string Nome { get; set; } = string.Empty;
    public int Quantidade { get; set; } = 1;
    public int PrecoUnitario { get; set; }

    public int ProdutoLojaId { get; set; } // O ProdutoLoja do adicional (para saber preço/estoque da loja)
    public ProdutoLoja ProdutoLoja { get; set; } = null!;

    public int PrecoVenda { get; set; } // Preço cobrado no momento
}
