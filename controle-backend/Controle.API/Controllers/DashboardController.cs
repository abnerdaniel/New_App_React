using System.Collections.Generic;
using System.ComponentModel;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [DisplayName("Dashboard e Relatórios")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Obtém o resumo financeiro e operacional do dia atual.
        /// </summary>
        /// <param name="lojaId">ID da loja.</param>
        /// <response code="200">Resumo do dia retornado com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("loja/{lojaId}/resumo")]
        [ProducesResponseType(typeof(DashboardResumoDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetResumoDoDia(Guid lojaId)
        {
            var resumo = await _dashboardService.GetResumoDoDiaAsync(lojaId);
            return Ok(resumo);
        }

        /// <summary>
        /// Obtém o ranking dos produtos mais vendidos.
        /// </summary>
        /// <param name="lojaId">ID da loja.</param>
        /// <response code="200">Ranking de produtos retornado com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("loja/{lojaId}/ranking")]
        [ProducesResponseType(typeof(IEnumerable<ProdutoRankingDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetProdutosMaisVendidos(Guid lojaId)
        {
            var ranking = await _dashboardService.GetProdutosMaisVendidosAsync(lojaId);
            return Ok(ranking);
        }
        /// <summary>
        /// Obtém o resumo financeiro por período.
        /// </summary>
        [HttpGet("loja/{lojaId}/financeiro")]
        [ProducesResponseType(typeof(FinanceiroResumoDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFinanceiroResumo(Guid lojaId, [FromQuery] DateTime inicio, [FromQuery] DateTime fim)
        {
            var resumo = await _dashboardService.GetFinanceiroResumoAsync(lojaId, inicio, fim);
            return Ok(resumo);
        }

        /// <summary>
        /// Obtém a lista de transações por período.
        /// </summary>
        [HttpGet("loja/{lojaId}/transacoes")]
        [ProducesResponseType(typeof(IEnumerable<TransacaoDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTransacoes(Guid lojaId, [FromQuery] DateTime inicio, [FromQuery] DateTime fim)
        {
            var transacoes = await _dashboardService.GetTransacoesAsync(lojaId, inicio, fim);
            return Ok(transacoes);
        }

        /// <summary>
        /// Obtém o funil de pedidos em tempo real.
        /// </summary>
        [HttpGet("loja/{lojaId}/funil")]
        [ProducesResponseType(typeof(DashboardFunilDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFunil(Guid lojaId)
        {
            var funil = await _dashboardService.GetFunilPedidosAsync(lojaId);
            return Ok(funil);
        }

        /// <summary>
        /// Obtém alertas críticos (estoque baixo, atrasos).
        /// </summary>
        [HttpGet("loja/{lojaId}/alertas")]
        [ProducesResponseType(typeof(IEnumerable<DashboardAlertaDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAlertas(Guid lojaId)
        {
            var alertas = await _dashboardService.GetAlertasAsync(lojaId);
            return Ok(alertas);
        }
    }
}
