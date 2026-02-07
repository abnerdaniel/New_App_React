namespace Controle.Application.DTOs
{
    /// <summary>
    /// DTO para receber o token de autenticação do Google para clientes.
    /// </summary>
    public class ClienteGoogleLoginRequest
    {
        public string IdToken { get; set; } = string.Empty;
    }
}
