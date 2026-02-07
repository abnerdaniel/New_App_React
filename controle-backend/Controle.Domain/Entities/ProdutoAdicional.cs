using System.ComponentModel.DataAnnotations.Schema;

namespace Controle.Domain.Entities;

public class ProdutoAdicional
{
    public int ProdutoPaiId { get; set; }
    public Produto ProdutoPai { get; set; } = null!;

    public int ProdutoFilhoId { get; set; } // O Adicional
    public Produto ProdutoFilho { get; set; } = null!;
}
