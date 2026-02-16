using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/categorias")]
    [Authorize]
    public class CategoriaController : ControllerBase
    {
        private readonly ICategoriaService _categoriaService;

        public CategoriaController(ICategoriaService categoriaService)
        {
            _categoriaService = categoriaService;
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] CreateCategoriaDTO dto)
        {
            var cat = await _categoriaService.CriarCategoriaAsync(dto);
            return CreatedAtAction(nameof(Obter), new { id = cat.Id }, cat);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Obter(int id)
        {
            var cat = await _categoriaService.ObterPorIdAsync(id);
            if (cat == null) return NotFound();
            return Ok(cat);
        }

        [HttpGet("cardapio/{cardapioId}")]
        public async Task<IActionResult> ListarPorCardapio(int cardapioId)
        {
            var list = await _categoriaService.ListarPorCardapioAsync(cardapioId);
            return Ok(list);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] UpdateCategoriaDTO dto)
        {
            try {
                var cat = await _categoriaService.AtualizarCategoriaAsync(id, dto);
                return Ok(cat);
            } catch (System.Exception ex) {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            try {
                await _categoriaService.ExcluirCategoriaAsync(id);
                return NoContent();
            } catch (System.Exception ex) {
                 return BadRequest(new { message = ex.Message });
            }
        }
    }
}
