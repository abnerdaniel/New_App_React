namespace Controle.Domain.Entities;

// Join: qual valor de atributo esta variante tem (ex: Variante "M Azul" tem ValorId=M e ValorId=Azul)
public class ProdutoVarianteAtributo
{
    public int ProdutoVarianteId { get; set; }
    public ProdutoVariante ProdutoVariante { get; set; } = null!;
    
    public int VarianteAtributoValorId { get; set; }
    public VarianteAtributoValor VarianteAtributoValor { get; set; } = null!;
}
