using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Services; // For Result class

namespace Controle.Application.Interfaces
{
    public interface IFuncionarioService
    {
        Task<Result> CadastrarFuncionarioAsync(string nome, string email, string login, string password, string cargoNome, Guid lojaId);
        Task<IEnumerable<FuncionarioDTO>> ListarEquipeAsync(Guid lojaId);
        Task<Result> BloquearAcessoAsync(int funcionarioId);
    }
}
