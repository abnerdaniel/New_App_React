using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Exceptions;
using System;
using System.Threading.Tasks;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/produto-loja")]
    [Authorize]
    public class ProdutoLojaController : ControllerBase
    {
        private readonly IProdutoLojaService _produtoLojaService;

        public ProdutoLojaController(IProdutoLojaService produtoLojaService)
        {
            _produtoLojaService = produtoLojaService;
        }

        /// <summary>
        /// Adiciona um produto específico a uma loja.
        /// </summary>
        /// <response code="201">Produto associado à loja com sucesso.</response>
        /// <response code="400">Erro na solicitação.</response>
        /// <response code="401">Não autorizado.</response>
        /// <response code="500">Erro interno.</response>
        [HttpPost]
        [ProducesResponseType(typeof(ProdutoLojaDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AdicionarProdutoLoja([FromBody] CreateProdutoLojaRequest dto)
        {
            try
            {
                var produtoLoja = await _produtoLojaService.AdicionarProdutoLojaAsync(dto);
                return CreatedAtAction(nameof(AdicionarProdutoLoja), new { id = produtoLoja.Id }, produtoLoja);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza informações de um produto em uma loja (ex: preço, estoque).
        /// </summary>
        /// <response code="200">Produto atualizado com sucesso.</response>
        /// <response code="400">Erro na solicitação.</response>
        /// <response code="401">Não autorizado.</response>
        /// <response code="500">Erro interno.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ProdutoLojaDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AtualizarProdutoLoja(int id, [FromBody] UpdateProdutoLojaRequest dto)
        {
            try
            {
                var produtoLoja = await _produtoLojaService.UpdateProdutoLojaAsync(id, dto);
                return Ok(produtoLoja);
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Erro interno ao atualizar produto da loja." });
            }
        }

        /// <summary>
        /// Remove um produto de uma loja.
        /// </summary>
        /// <response code="204">Produto removido com sucesso.</response>
        /// <response code="400">Erro na solicitação.</response>
        /// <response code="401">Não autorizado.</response>
        /// <response code="500">Erro interno.</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RemoverProdutoLoja(int id)
        {
            try
            {
                await _produtoLojaService.DeleteProdutoLojaAsync(id);
                return NoContent();
            }
            catch (DomainException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Erro interno ao remover produto da loja." });
            }
        }

        /// <summary>
        /// Obtém o estoque de produtos de uma loja.
        /// </summary>
        /// <response code="200">Estoque retornado com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("loja/{lojaId}/estoque")]
        [ProducesResponseType(typeof(IEnumerable<ProdutoLojaDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObterEstoquePorLoja(Guid lojaId)
        {
            var estoque = await _produtoLojaService.ObterEstoquePorLojaAsync(lojaId);
            return Ok(estoque);
        }
    }
}
