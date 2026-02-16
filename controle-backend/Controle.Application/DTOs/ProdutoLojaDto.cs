using System.Text.Json.Serialization;

namespace Controle.Application.DTOs
{
    public class ProdutoLojaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Preco { get; set; }
        public string Descricao { get; set; } = string.Empty;
    }
}
