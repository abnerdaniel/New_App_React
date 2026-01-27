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
        [HttpGet("loja/{lojaId}/resumo")]
        [ProducesResponseType(typeof(DashboardResumoDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetResumoDoDia(int lojaId)
        {
            var resumo = await _dashboardService.GetResumoDoDiaAsync(lojaId);
            return Ok(resumo);
        }

        /// <summary>
        /// Obtém o ranking dos produtos mais vendidos.
        /// </summary>
        /// <param name="lojaId">ID da loja.</param>
        /// <response code="200">Ranking de produtos retornado com sucesso.</response>
        [HttpGet("loja/{lojaId}/ranking")]
        [ProducesResponseType(typeof(IEnumerable<ProdutoRankingDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProdutosMaisVendidos(int lojaId)
        {
            var ranking = await _dashboardService.GetProdutosMaisVendidosAsync(lojaId);
            return Ok(ranking);
        }
    }
}
