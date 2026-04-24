using System.ComponentModel.DataAnnotations.Schema;

namespace Controle.Domain.Entities;

public class ProdutoAdicional
{
    public int ProdutoPaiId { get; set; }
    public Produto ProdutoPai { get; set; } = null!;

    public int ProdutoFilhoId { get; set; } // O Adicional
    public Produto ProdutoFilho { get; set; } = null!;
    
    public int QuantidadeMinima { get; set; } = 0;
    public int QuantidadeMaxima { get; set; } = 1; // -1 = ilimitado
    public decimal? PrecoOverride { get; set; } // Opcional, substitui o preco da loja se existir
}
