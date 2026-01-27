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
    }

    public class AuthResponse
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Login { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
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
