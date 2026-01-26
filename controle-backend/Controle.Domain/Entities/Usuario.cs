using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;

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
