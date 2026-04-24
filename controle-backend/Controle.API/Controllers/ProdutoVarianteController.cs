using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Authorize]
    public class ProdutoVarianteController : ControllerBase
    {
        private readonly ProdutoVarianteService _service;

        public ProdutoVarianteController(ProdutoVarianteService service)
        {
            _service = service;
        }

        // GET /api/produto-loja/{id}/variantes
        [HttpGet("api/produto-loja/{id}/variantes")]
        public async Task<IActionResult> Listar(int id)
            => Ok(await _service.ListarPorProdutoAsync(id));

        // POST /api/produto-loja/{id}/gerar-variantes
        [HttpPost("api/produto-loja/{id}/gerar-variantes")]
        public async Task<IActionResult> GerarVariantes(int id, [FromBody] GerarVariantesRequest dto)
            => Ok(await _service.GerarVariantesAsync(id, dto));

        // PUT /api/produto-loja/{id}/variantes
        [HttpPut("api/produto-loja/{id}/variantes")]
        public async Task<IActionResult> SalvarVariantes(int id, [FromBody] SalvarVariantesRequest dto)
            => Ok(await _service.SalvarVariantesAsync(id, dto));

        // PATCH /api/variantes/{id}/estoque
        [HttpPatch("api/variantes/{id}/estoque")]
        public async Task<IActionResult> AtualizarEstoque(int id, [FromBody] AtualizarEstoqueVarianteRequest dto)
        {
            var ok = await _service.AtualizarEstoqueAsync(id, dto);
            return ok ? Ok() : NotFound();
        }
    }
}
