namespace Controle.Application.DTOs
{
    public class LojaConfiguracaoDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string Segmento { get; set; } = "Food";
        public string? LogoUrl { get; set; }
        public int? TempoMinimoEntrega { get; set; }
        public int? TempoMaximoEntrega { get; set; }
    }
}
