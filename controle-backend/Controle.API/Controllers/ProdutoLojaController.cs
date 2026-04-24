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
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExcluirProdutoLoja(int id)
        {
            try
            {
                await _produtoLojaService.DeleteProdutoLojaAsync(id);
                return Ok(new { message = "Produto removido da loja com sucesso." });
            }
            catch (Exception ex)
            {
                var errorMsg = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"ERRO AO EXCLUIR: {errorMsg}");
                return BadRequest(new { message = errorMsg });
            }
        }

        [HttpPost("{id}/imagens")]
        [ProducesResponseType(typeof(ProdutoImagemDTO), StatusCodes.Status201Created)]
        public async Task<IActionResult> UploadImagem(int id, [FromBody] AddProdutoImagemDTO dto)
        {
            try
            {
                var imagem = await _produtoLojaService.AdicionarImagemAsync(id, dto);
                return CreatedAtAction(nameof(UploadImagem), new { id = imagem.Id }, imagem);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/imagens/{imagemId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> RemoverImagem(int id, int imagemId)
        {
            try
            {
                await _produtoLojaService.RemoverImagemAsync(id, imagemId);
                return Ok(new { message = "Imagem removida com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/imagens/ordem")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ReordenarImagens(int id, [FromBody] List<ImagemOrdemDTO> dto)
        {
            try
            {
                await _produtoLojaService.ReordenarImagensAsync(id, dto);
                return Ok(new { message = "Ordem das imagens atualizada com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
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

        [HttpPut("{id}/categorias")]
        public async Task<IActionResult> AtualizarCategorias(int id, [FromBody] List<int> categoriaIds)
        {
            await _produtoLojaService.AtualizarCategoriasProdutoAsync(id, categoriaIds);
            return NoContent();
        }

    }
}
