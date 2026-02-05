using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Services;

namespace Controle.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Result<AuthResponse>> LoginAsync(string login, string password);
        Task<Result<AuthResponse>> RegisterAsync(string nome, string login, string email, string password, Guid? lojaId = null, bool createFuncionario = true);
        Task<Result<AuthResponse>> LoginWithGoogleAsync(string idToken);
        Task<UsuarioResponse?> GetUsuarioByIdAsync(Guid id);
        Task<IEnumerable<UsuarioResponse>> GetAllUsuariosAsync();
        Task<Result> AtivarUsuarioAsync(Guid usuarioId);
        Task<Result> DesativarUsuarioAsync(Guid usuarioId);
    }
}
