namespace Controle.Domain.Entities;

/// <summary>
/// Grupo de opções de customização de um produto configurável (ex: "Tamanho", "Massa", "Borda")
/// </summary>
public class GrupoOpcao
{
    public int Id { get; set; }
    public int ProdutoLojaId { get; set; }
    public ProdutoLoja ProdutoLoja { get; set; } = null!;

    public string Nome { get; set; } = string.Empty; // ex: "Escolha o Tamanho"
    public int Ordem { get; set; } = 0;
    public int MinSelecao { get; set; } = 1;   // Mínimo de itens que o cliente deve selecionar
    public int MaxSelecao { get; set; } = 1;   // Máximo de itens que o cliente pode selecionar
    public bool Obrigatorio { get; set; } = true;

    public ICollection<OpcaoItem> Itens { get; set; } = new List<OpcaoItem>();
}
