using System;

namespace Controle.Application.DTOs
{
    public class LojaResumoDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Segmento { get; set; } = "Food";
        public string Slug { get; set; } = string.Empty;
        public string? Descricao { get; set; }

        public string? LogoUrl { get; set; }
        public string? CapaUrl { get; set; }
        public string? ImagemUrl { get; set; } // Legacy alias for Logo
        public string? BannerUrl { get; set; } // Legacy alias for Capa
        public double? Avaliacao { get; set; }
        public int TempoEntregaMin { get; set; }
        public int TempoEntregaMax { get; set; }
        public decimal TaxaEntrega { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public bool Aberta { get; set; }
        
        // SuperAdmin - Licenciamento
        public DateTime? LicencaValidaAte { get; set; }
        public bool BloqueadaPorFaltaDePagamento { get; set; }

        // Contato e Endereço
        public string? Telefone { get; set; }
        public string? WhatsApp { get; set; }
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }
        public string? Cep { get; set; }
        public string? Complemento { get; set; }
    }
}
