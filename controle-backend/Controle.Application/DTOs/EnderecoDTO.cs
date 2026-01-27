namespace Controle.Application.DTOs
{
    public class EnderecoDTO
    {
        public int Id { get; set; }
        public string Logradouro { get; set; } = string.Empty;
        public string Bairro { get; set; } = string.Empty;
        public string Cidade { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string CEP { get; set; } = string.Empty;
        public string Complemento { get; set; } = string.Empty;
        public string Numero { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
    }
}
