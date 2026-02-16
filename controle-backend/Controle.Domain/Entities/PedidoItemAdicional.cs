using System;

namespace Controle.Domain.Entities;

public class PedidoItemAdicional
{
    public int Id { get; set; }
    
    public int PedidoItemId { get; set; }
    public PedidoItem PedidoItem { get; set; } = null!;

    public int ProdutoLojaId { get; set; } // O ProdutoLoja do adicional (para saber preço/estoque da loja)
    public ProdutoLoja ProdutoLoja { get; set; } = null!;

    public int PrecoVenda { get; set; } // Preço cobrado no momento
}
