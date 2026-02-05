using System.ComponentModel.DataAnnotations;

namespace Controle.Application.DTOs
{
    public class RegisterFuncionarioRequest
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "O login é obrigatório.")]
        [MinLength(3, ErrorMessage = "O login deve ter no mínimo 3 caracteres.")]
        public string Login { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória.")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "O cargo é obrigatório.")]
        public string Cargo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A loja é obrigatória.")]
        public Guid LojaId { get; set; }
    }
}
