using System.ComponentModel.DataAnnotations;

namespace Controle.Application.DTOs
{
    public class PreRegistroPdvDTO
    {
        [Required]
        public string Nome { get; set; } = string.Empty;
        
        [Required]
        public string Telefone { get; set; } = string.Empty;
        
        public string? Email { get; set; }
        
        [Required]
        public EnderecoDTO Endereco { get; set; } = new EnderecoDTO();
    }
}
