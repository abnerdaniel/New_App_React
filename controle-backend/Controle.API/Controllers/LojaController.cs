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
        /// Cria uma nova loja.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CriarLoja([FromBody] CreateLojaDTO dto)
        {
            var loja = await _lojaService.CriarLojaAsync(dto);
            return StatusCode(StatusCodes.Status201Created, loja);
        }

        /// <summary>
        /// Atualiza os dados cadastrais da loja.
        /// </summary>
        [HttpPut("{lojaId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AtualizarLoja(Guid lojaId, [FromBody] UpdateLojaDTO dto)
        {
            var loja = await _lojaService.AtualizarLojaAsync(lojaId, dto);
            return Ok(loja);
        }

        /// <summary>
        /// Atualiza as configurações da loja.
        /// </summary>
        [HttpPut("{lojaId}/config")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AtualizarConfiguracoes(Guid lojaId, [FromBody] LojaConfiguracaoDTO dto)
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
        public async Task<IActionResult> GerirTaxasEntrega(Guid lojaId, [FromBody] TaxaEntregaDTO dto)
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
        public async Task<IActionResult> AbrirFecharLoja(Guid lojaId, [FromBody] bool aberta)
        {
            var loja = await _lojaService.AbrirFecharLojaAsync(lojaId, aberta);
            return Ok(loja);
        }
    }
}
