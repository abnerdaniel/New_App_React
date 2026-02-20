#nullable disable
using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;

namespace Controle.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResumoDTO> GetResumoDoDiaAsync(Guid lojaId);
        Task<IEnumerable<ProdutoRankingDTO>> GetProdutosMaisVendidosAsync(Guid lojaId);
        Task<FinanceiroResumoDTO> GetFinanceiroResumoAsync(Guid lojaId, DateTime inicio, DateTime fim);
        Task<IEnumerable<TransacaoDTO>> GetTransacoesAsync(Guid lojaId, DateTime inicio, DateTime fim);
        Task<DashboardFunilDTO> GetFunilPedidosAsync(Guid lojaId);
        Task<IEnumerable<DashboardAlertaDTO>> GetAlertasAsync(Guid lojaId);
    }
}
