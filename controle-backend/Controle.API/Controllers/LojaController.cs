using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/loja")]
    [Authorize]
    public class LojaController : ControllerBase
    {
        private readonly ILojaService _lojaService;

        public LojaController(ILojaService lojaService)
        {
            _lojaService = lojaService;
        }

        /// <summary>
        /// Atualiza as configurações da loja.
        /// </summary>
        [HttpPut("{lojaId}/config")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AtualizarConfiguracoes(int lojaId, [FromBody] LojaConfiguracaoDTO dto)
        {
            var loja = await _lojaService.AtualizarConfiguracoesAsync(lojaId, dto);
            return Ok(loja);
        }

        /// <summary>
        /// Gerencia as taxas de entrega da loja.
        /// </summary>
        [HttpPatch("{lojaId}/taxas")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GerirTaxasEntrega(int lojaId, [FromBody] TaxaEntregaDTO dto)
        {
            var loja = await _lojaService.GerirTaxasEntregaAsync(lojaId, dto);
            return Ok(loja);
        }

        /// <summary>
        /// Abre ou fecha a loja manualmente.
        /// </summary>
        [HttpPatch("{lojaId}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AbrirFecharLoja(int lojaId, [FromBody] bool aberta)
        {
            var loja = await _lojaService.AbrirFecharLojaAsync(lojaId, aberta);
            return Ok(loja);
        }
    }
}
