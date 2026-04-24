namespace Controle.Domain.Entities;

/// <summary>
/// Item dentro de um grupo de opções (ex: "P", "M", "G", "Calabresa", "Mussarela")
/// </summary>
public class OpcaoItem
{
    public int Id { get; set; }
    public int GrupoOpcaoId { get; set; }
    public GrupoOpcao GrupoOpcao { get; set; } = null!;

    public string Nome { get; set; } = string.Empty; // ex: "Queijo Extra"
    public int Preco { get; set; } = 0; // Em centavos (pode ser 0 se não adiciona custo)
    public int Ordem { get; set; } = 0;
    public bool Ativo { get; set; } = true;
}
