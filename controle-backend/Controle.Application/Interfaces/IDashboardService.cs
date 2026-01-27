using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;

namespace Controle.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResumoDTO> GetResumoDoDiaAsync(Guid lojaId);
        Task<IEnumerable<ProdutoRankingDTO>> GetProdutosMaisVendidosAsync(Guid lojaId);
    }
}
