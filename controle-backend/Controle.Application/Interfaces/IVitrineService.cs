using System.Threading.Tasks;
using Controle.Application.DTOs;

namespace Controle.Application.Interfaces
{
    public interface IVitrineService
    {
        Task<VitrineDTO?> ObterLojaParaClienteAsync(string lojaIdentifier);
        Task<List<LojaResumoDTO>> ListarLojasAtivasAsync();
    }
}
