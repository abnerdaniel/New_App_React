using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/produtos")]
    [Authorize]
    public class ProdutoController : ControllerBase
    {
        private readonly IProdutoService _produtoService;

        public ProdutoController(IProdutoService produtoService)
        {
            _produtoService = produtoService;
        }

        /// <summary>
        /// Lista todos os produtos.
        /// </summary>
        /// <response code="200">Lista de produtos retornada com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObterTodos()
        {
            var produtos = await _produtoService.ObterTodosAsync();
            return Ok(produtos);
        }

        /// <summary>
        /// Obtém um produto pelo ID.
        /// </summary>
        /// <response code="200">Produto encontrado.</response>
        /// <response code="404">Produto não encontrado.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var produto = await _produtoService.ObterPorIdAsync(id);
            return Ok(produto);
        }

        /// <summary>
        /// Obtém produtos por tipo.
        /// </summary>
        /// <response code="200">Lista de produtos retornada com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("tipo/{tipo}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObterPorTipo(string tipo)
        {
            var produtos = await _produtoService.ObterPorTipoAsync(tipo);
            return Ok(produtos);
        }

        /// <summary>
        /// Cria um novo produto.
        /// </summary>
        /// <response code="201">Produto criado com sucesso.</response>
        /// <response code="400">Erro ao criar produto.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Adicionar([FromBody] CreateProdutoDTO dto)
        {
            var produto = await _produtoService.AdicionarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = produto.Id }, produto);
        }

        /// <summary>
        /// Atualiza um produto existente.
        /// </summary>
        /// <response code="200">Produto atualizado com sucesso.</response>
        /// <response code="400">Erro ao atualizar produto.</response>
        /// <response code="404">Produto não encontrado.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Atualizar(int id, [FromBody] UpdateProdutoDTO dto)
        {
            var produto = await _produtoService.AtualizarAsync(id, dto);
            return Ok(produto);
        }

        /// <summary>
        /// Remove um produto.
        /// </summary>
        /// <response code="204">Produto removido com sucesso.</response>
        /// <response code="404">Produto não encontrado.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Remover(int id)
        {
            await _produtoService.RemoverAsync(id);
            return NoContent();
        }
    }
}
