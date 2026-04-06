using System.ComponentModel.DataAnnotations;

namespace Controle.Application.DTOs
{
    public class AIPayloadProdutoRequest
    {
        [Required]
        public string TelefoneLoja { get; set; } = string.Empty;

        [Required]
        public string Nome { get; set; } = string.Empty;

        public string Descricao { get; set; } = string.Empty;
        
        [Required]
        public decimal Preco { get; set; }

        public string Tipo { get; set; } = string.Empty;

        public int? CategoriaId { get; set; }

        public bool Disponivel { get; set; } = true;
        
        public int? Estoque { get; set; }

        public string? ImagemUrl { get; set; }
    }
}
