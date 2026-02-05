namespace Controle.Application.DTOs
{
    public class CreateLojaDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string CpfCnpj { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Instagram { get; set; } = string.Empty;
        public string Facebook { get; set; } = string.Empty;
        public string Twitter { get; set; } = string.Empty;
        public string LinkedIn { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string Telegram { get; set; } = string.Empty;
        public string YouTube { get; set; } = string.Empty;
        public string Twitch { get; set; } = string.Empty;
        public string TikTok { get; set; } = string.Empty;
        // Endereço
        public string? Cep { get; set; }
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }

        public Guid UsuarioId { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
