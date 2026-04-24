namespace Controle.Application.DTOs;

public class TipoProdutoDTO
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Icone { get; set; }
    public bool Ativo { get; set; }
}

public class CreateTipoProdutoDTO
{
    public string Nome { get; set; } = string.Empty;
    public string? Icone { get; set; }
}

public class UpdateTipoProdutoDTO
{
    public string Nome { get; set; } = string.Empty;
    public string? Icone { get; set; }
    public bool Ativo { get; set; }
}
