using System;
using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/mesas")]
    [Authorize]
    public class MesasController : ControllerBase
    {
        private readonly IMesaService _mesaService;

        public MesasController(IMesaService mesaService)
        {
            _mesaService = mesaService;
        }

        [HttpGet("{lojaId}")]
        public async Task<IActionResult> ListarMesas(Guid lojaId)
        {
            var mesas = await _mesaService.ListarMesasAsync(lojaId);
            return Ok(mesas);
        }

        [HttpPost("configurar")]
        public async Task<IActionResult> ConfigurarMesas([FromBody] ConfigurarMesasRequest request)
        {
            await _mesaService.ConfigurarMesasAsync(request.LojaId, request.Quantidade);
            return Ok();
        }

        [HttpPatch("{id}/apelido")]
        public async Task<IActionResult> AtualizarApelido(int id, [FromBody] string apelido)
        {
            await _mesaService.AtualizarApelidoAsync(id, apelido);
            return Ok();
        }

        [HttpPost("{id}/abrir")]
        public async Task<IActionResult> AbrirMesa(int id, [FromBody] AbrirMesaRequest request)
        {
            var mesa = await _mesaService.AbrirMesaAsync(id, request.NomeCliente);
            return Ok(mesa);
        }

        [HttpPost("{id}/liberar")]
        public async Task<IActionResult> LiberarMesa(int id)
        {
            await _mesaService.LiberarMesaAsync(id);
            return Ok();
        }
        
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] string status)
        {
            var mesa = await _mesaService.AtualizarStatusAsync(id, status);
            return Ok(mesa);
        }
    }

    public class ConfigurarMesasRequest
    {
        public Guid LojaId { get; set; }
        public int Quantidade { get; set; }
    }

    public class AbrirMesaRequest
    {
        public string? NomeCliente { get; set; }
    }
}
