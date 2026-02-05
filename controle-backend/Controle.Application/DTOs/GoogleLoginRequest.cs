namespace Controle.Application.DTOs
{
    /// <summary>
    /// DTO para receber o token de autenticação do Google.
    /// </summary>
    public class GoogleLoginRequest
    {
        public string IdToken { get; set; }
    }
}
