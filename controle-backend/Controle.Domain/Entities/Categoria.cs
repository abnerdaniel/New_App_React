using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int CardapioId { get; set; }
    public Cardapio? Cardapio { get; set; }
    public int OrdemExibicao { get; set; } = 0;
    public List<ProdutoLoja> Produtos { get; set; } = new();
}