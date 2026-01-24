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
        Task<Result<AuthResponse>> LoginAsync(string email, string password);
        Task<Result<AuthResponse>> RegisterAsync(string nome, string email, string password);
        Task<UsuarioResponse?> GetUsuarioByIdAsync(int id);
        Task<IEnumerable<UsuarioResponse>> GetAllUsuariosAsync();
        Task<Result> AtivarUsuarioAsync(int usuarioId);
        Task<Result> DesativarUsuarioAsync(int usuarioId);
    }
}
