Regra de negocios 

public class Usuario
{
    public int Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool Ativo { get; set; } = false; // Usuário inativo até aprovação do admin
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime? UltimoAcesso { get; set; }
}

public class Funcionario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;// Nome do Funcionario
    public int CargoId { get; set; } = 0;// Cargo que trabalha
    public int LojaId { get; set; } = 0;// Loja que trabalha
    public int UsuarioId { get; set; } = 0;// Usuario que cadastra
    public bool Ativo { get; set; } = false;// Usuario que cadastra
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}