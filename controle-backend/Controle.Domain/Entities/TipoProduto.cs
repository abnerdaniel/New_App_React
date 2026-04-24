namespace Controle.Domain.Entities;

public class TipoProduto
{
    public int Id { get; set; }
    public Guid LojaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Icone { get; set; }
    public bool Ativo { get; set; } = true;

    public ICollection<ProdutoLoja> Produtos { get; set; } = new List<ProdutoLoja>();
}
