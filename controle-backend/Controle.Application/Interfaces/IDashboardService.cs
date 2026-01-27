using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;

namespace Controle.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResumoDTO> GetResumoDoDiaAsync(int lojaId);
        Task<IEnumerable<ProdutoRankingDTO>> GetProdutosMaisVendidosAsync(int lojaId);
    }
}
