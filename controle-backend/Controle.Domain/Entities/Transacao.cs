namespace Controle.Domain.Entities;

public class Transacao
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Tipo { get; set; } = string.Empty; // despesa ou receita
    public int PessoaId { get; set; }
    public int CategoriaId { get; set; }
    
    // Navegação
    public Pessoa Pessoa { get; set; } = null!;
    public Categoria Categoria { get; set; } = null!;
}