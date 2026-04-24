using System;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/produto-loja/{produtoLojaId}/grupos-opcao")]
    [Authorize]
    public class GrupoOpcaoController : ControllerBase
    {
        private readonly IGrupoOpcaoService _service;

        public GrupoOpcaoController(IGrupoOpcaoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Listar(int produtoLojaId)
        {
            var grupos = await _service.ListarPorProdutoAsync(produtoLojaId);
            return Ok(grupos);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Criar(int produtoLojaId, [FromBody] CreateGrupoOpcaoRequest request)
        {
            try
            {
                var grupo = await _service.CriarGrupoAsync(produtoLojaId, request);
                return CreatedAtAction(nameof(Listar), new { produtoLojaId }, grupo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{grupoId}")]
        public async Task<IActionResult> Atualizar(int produtoLojaId, int grupoId, [FromBody] UpdateGrupoOpcaoRequest request)
        {
            try
            {
                var grupo = await _service.AtualizarGrupoAsync(grupoId, request);
                return Ok(grupo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{grupoId}")]
        public async Task<IActionResult> Deletar(int produtoLojaId, int grupoId)
        {
            try
            {
                await _service.DeletarGrupoAsync(grupoId);
                return Ok(new { message = "Grupo removido." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ── Itens de um grupo ──────────────────────────────────────────────────

        [HttpPost("{grupoId}/itens")]
        public async Task<IActionResult> AdicionarItem(int produtoLojaId, int grupoId, [FromBody] CreateOpcaoItemRequest request)
        {
            try
            {
                var item = await _service.AdicionarItemAsync(grupoId, request);
                return CreatedAtAction(nameof(AdicionarItem), new { produtoLojaId, grupoId }, item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{grupoId}/itens/{itemId}")]
        public async Task<IActionResult> AtualizarItem(int produtoLojaId, int grupoId, int itemId, [FromBody] UpdateOpcaoItemRequest request)
        {
            try
            {
                var item = await _service.AtualizarItemAsync(itemId, request);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{grupoId}/itens/{itemId}")]
        public async Task<IActionResult> DeletarItem(int produtoLojaId, int grupoId, int itemId)
        {
            try
            {
                await _service.DeletarItemAsync(itemId);
                return Ok(new { message = "Item removido." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
