using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class ProdutoVariante
{
    public int Id { get; set; }
    public int ProdutoLojaId { get; set; }
    public ProdutoLoja ProdutoLoja { get; set; } = null!;
    
    public string SKU { get; set; } = string.Empty;
    public int Preco { get; set; }       // Em centavos
    public int Estoque { get; set; } = 0;
    public bool Disponivel { get; set; } = true;
    public string? ImagemUrl { get; set; }
    
    public ICollection<ProdutoVarianteAtributo> Atributos { get; set; } = new List<ProdutoVarianteAtributo>();
}
