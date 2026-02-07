using System;

namespace Controle.Application.DTOs
{
    public class LojaResumoDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string? ImagemUrl { get; set; }
        public string? BannerUrl { get; set; }
        public double? Avaliacao { get; set; }
        public int TempoEntregaMin { get; set; }
        public int TempoEntregaMax { get; set; }
        public decimal TaxaEntrega { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public bool Aberta { get; set; }
    }
}
