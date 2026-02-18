using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Controle.Application.DTOs
{
    public class LoginRequest
    {
        [Required]
        public string Login { get; set; } = null!;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }

    public class RegisterRequest
    {
        [Required]
        public string Nome { get; set; } = null!;

        [Required]
        public string Login { get; set; } = null!;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        public Guid? LojaId { get; set; }
    }

    public class AuthResponse
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Login { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public List<LojaResumoDTO> Lojas { get; set; } = new();
        public List<FuncionarioResumoDTO> Funcionarios { get; set; } = new();
    }



    public class FuncionarioResumoDTO
    {
        public int Id { get; set; }
        public Guid? LojaId { get; set; }
        public string Cargo { get; set; } = string.Empty;
        public bool Ativo { get; set; }
        public bool AcessoSistemaCompleto { get; set; }
        public string? Telefone { get; set; }
    }

    public class UsuarioResponse
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Login { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? UltimoAcesso { get; set; }
    }
}
