using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers;

[ApiController]
[Route("api/tipos-produto")]
[Authorize]
public class TipoProdutoController : ControllerBase
{
    private readonly ITipoProdutoService _service;

    public TipoProdutoController(ITipoProdutoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] Guid lojaId)
    {
        var tipos = await _service.ListarPorLojaAsync(lojaId);
        return Ok(tipos);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromQuery] Guid lojaId, [FromBody] CreateTipoProdutoDTO dto)
    {
        var tipo = await _service.CriarAsync(lojaId, dto);
        return Created($"/api/tipos-produto/{tipo.Id}", tipo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromQuery] Guid lojaId, [FromBody] UpdateTipoProdutoDTO dto)
    {
        try
        {
            var tipo = await _service.AtualizarAsync(id, lojaId, dto);
            return Ok(tipo);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id, [FromQuery] Guid lojaId)
    {
        try
        {
            await _service.ExcluirAsync(id, lojaId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
