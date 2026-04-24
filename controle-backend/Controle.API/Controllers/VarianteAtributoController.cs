using System;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/atributos")]
    [Authorize]
    public class VarianteAtributoController : ControllerBase
    {
        private readonly VarianteAtributoService _service;

        public VarianteAtributoController(VarianteAtributoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Listar([FromQuery] Guid lojaId)
            => Ok(await _service.ListarPorLojaAsync(lojaId));

        [HttpPost]
        public async Task<IActionResult> Criar([FromQuery] Guid lojaId, [FromBody] CreateVarianteAtributoRequest dto)
        {
            var resultado = await _service.CriarAsync(lojaId, dto);
            return Created($"/api/atributos/{resultado.Id}", resultado);
        }

        [HttpPost("{id}/valores")]
        public async Task<IActionResult> AddValor(int id, [FromBody] AddVarianteAtributoValorRequest dto)
            => Ok(await _service.AddValorAsync(id, dto));

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoverAtributo(int id)
        {
            var ok = await _service.RemoverAtributoAsync(id);
            return ok ? NoContent() : NotFound();
        }

        [HttpDelete("valores/{id}")]
        public async Task<IActionResult> RemoverValor(int id)
        {
            var ok = await _service.RemoverValorAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
