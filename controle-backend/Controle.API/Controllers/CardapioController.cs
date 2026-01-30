using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/cardapios")]
    [Authorize]
    public class CardapioController : ControllerBase
    {
        private readonly ICardapioService _cardapioService;

        public CardapioController(ICardapioService cardapioService)
        {
            _cardapioService = cardapioService;
        }

        /// <summary>
        /// Cria um novo cardápio.
        /// </summary>
        /// <remarks>
        /// Requer autenticação JWT.
        /// </remarks>
        /// <response code="201">Cardápio criado com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CriarCardapio([FromBody] CreateCardapioDTO dto)
        {
            var cardapio = new Cardapio
            {
                LojaId = dto.LojaId,
                Nome = dto.Nome,
                HorarioInicio = dto.HorarioInicio,
                HorarioFim = dto.HorarioFim,
                DiasSemana = dto.DiasSemana,
                Ativo = dto.Ativo
            };

            var novoCardapio = await _cardapioService.CriarCardapioAsync(cardapio);
            return CreatedAtAction(nameof(ObterCardapio), new { id = novoCardapio.Id }, novoCardapio);
        }

        /// <summary>
        /// Obtém os detalhes de um cardápio.
        /// </summary>
        /// <response code="200">Cardápio encontrado.</response>
        /// <response code="404">Cardápio não encontrado.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObterCardapio(int id)
        {
            var cardapio = await _cardapioService.ObterCardapioCompletoAsync(id);
            if (cardapio == null) return NotFound();
            return Ok(cardapio);
        }
    }
}
