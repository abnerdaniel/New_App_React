using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Controle.Domain.Entities;

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
        /// Obtém os dados completos de uma loja pelo ID.
        /// </summary>
        [HttpGet("{lojaId}")]
        [ProducesResponseType(typeof(Loja), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetLojaById(Guid lojaId)
        {
            var loja = await _lojaService.GetLojaByIdAsync(lojaId);
            if (loja == null) return NotFound();
            return Ok(loja);
        }

        /// <summary>
        /// Lista as lojas do usuário logado.
        /// </summary>
        [HttpGet("usuario/{usuarioId}")]
        [ProducesResponseType(typeof(IEnumerable<Loja>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarLojasDoUsuario(Guid usuarioId)
        {
            // Opcional: Verificar se o ID bate com o Token p/ segurança extra
            var lojas = await _lojaService.GetLojasByUsuarioIdAsync(usuarioId);
            return Ok(lojas);
        }

        /// <remarks>
        /// Requer autenticação JWT.
        /// </remarks>
        /// <response code="201">Loja criada com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CriarLoja([FromBody] CreateLojaDTO dto)
        {
            var loja = await _lojaService.CriarLojaAsync(dto);
            return StatusCode(StatusCodes.Status201Created, loja);
        }

        /// <summary>
        /// Atualiza os dados cadastrais da loja.
        /// </summary>

        /// <response code="200">Loja atualizada com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="404">Loja não encontrada.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPut("{lojaId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AtualizarLoja(Guid lojaId, [FromBody] UpdateLojaDTO dto)
        {
            var loja = await _lojaService.AtualizarLojaAsync(lojaId, dto);
            return Ok(loja);
        }

        /// <summary>
        /// Atualiza as configurações da loja.
        /// </summary>

        /// <response code="200">Configurações atualizadas com sucesso.</response>
        /// <response code="400">Erro ao atualizar configurações.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPut("{lojaId}/config")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AtualizarConfiguracoes(Guid lojaId, [FromBody] LojaConfiguracaoDTO dto)
        {
            var loja = await _lojaService.AtualizarConfiguracoesAsync(lojaId, dto);
            return Ok(loja);
        }

        /// <summary>
        /// Gerencia as taxas de entrega da loja.
        /// </summary>

        /// <response code="200">Taxas atualizadas com sucesso.</response>
        /// <response code="400">Erro ao atualizar taxas.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPatch("{lojaId}/taxas")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GerirTaxasEntrega(Guid lojaId, [FromBody] TaxaEntregaDTO dto)
        {
            var loja = await _lojaService.GerirTaxasEntregaAsync(lojaId, dto);
            return Ok(loja);
        }

        /// <summary>
        /// Abre ou fecha a loja manualmente.
        /// </summary>

        /// <response code="200">Status atualizado com sucesso.</response>
        /// <response code="400">Erro ao atualizar status.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPatch("{lojaId}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AbrirFecharLoja(Guid lojaId, [FromBody] bool aberta)
        {
            var loja = await _lojaService.AbrirFecharLojaAsync(lojaId, aberta);
            return Ok(loja);
        }
    }
}
