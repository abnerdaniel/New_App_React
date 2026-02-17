using System.Text.Json.Serialization;

namespace Controle.Application.DTOs
{
    public class ProdutoLojaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Preco { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? ImagemUrl { get; set; }
        public string CategoriaNome { get; set; } = "Outros";
    }
}
