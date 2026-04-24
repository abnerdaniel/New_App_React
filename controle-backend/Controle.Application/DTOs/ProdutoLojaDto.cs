using System.Text.Json.Serialization;

namespace Controle.Application.DTOs
{
    public class ProdutoLojaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Preco { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? CategoriaNome { get; set; }
        public string? ImagemUrl { get; set; }
        public string ModoCardapio { get; set; } = "Simples";
        public bool IsCombo { get; set; }
        public List<ProdutoVarianteDTO> Variantes { get; set; } = new();
        public List<GrupoOpcaoDTO> GruposOpcao { get; set; } = new();
        public List<ComboEtapaDTO> Etapas { get; set; } = new();
    }
}
