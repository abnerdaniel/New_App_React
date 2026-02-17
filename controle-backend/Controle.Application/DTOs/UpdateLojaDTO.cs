namespace Controle.Application.DTOs
{
    public class UpdateLojaDTO
    {
        public string? Nome { get; set; }
        public string? CpfCnpj { get; set; }
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Instagram { get; set; }
        public string? Facebook { get; set; }
        public string? Twitter { get; set; }
        public string? LinkedIn { get; set; }
        public string? WhatsApp { get; set; }
        public string? Telegram { get; set; }
        public string? YouTube { get; set; }
        public string? Twitch { get; set; }
        public string? TikTok { get; set; }
        
        // Endereço
        public string? Cep { get; set; }
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }

        public bool? Ativo { get; set; }
        
        // Configurações
        public string? Categoria { get; set; }
        public double? Avaliacao { get; set; }
        public int? TempoMinimoEntrega { get; set; }
        public int? TempoMaximoEntrega { get; set; }
        public decimal? TaxaEntregaFixa { get; set; }
        
        // Imagens
        public string? LogoUrl { get; set; }
        public string? CapaUrl { get; set; }
    }
}
