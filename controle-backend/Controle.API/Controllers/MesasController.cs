using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Controle.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/mesas")]
    [Authorize]
    public class MesasController : ControllerBase
    {
        private readonly IMesaService _mesaService;
        private readonly AppDbContext _context;

        public MesasController(IMesaService mesaService, AppDbContext context)
        {
            _mesaService = mesaService;
            _context = context;
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
            // Extract UsuarioId from JWT and look up Funcionario
            int? funcionarioId = null;
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(usuarioIdClaim, out var usuarioId))
            {
                var funcionario = await _context.Funcionarios
                    .FirstOrDefaultAsync(f => f.UsuarioId == usuarioId);
                funcionarioId = funcionario?.Id;
            }

            var mesa = await _mesaService.AbrirMesaAsync(id, request.NomeCliente, funcionarioId);
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

        [HttpDelete("pedido-item/{itemId}")]
        public async Task<IActionResult> RemoverItemPedido(int itemId)
        {
            await _mesaService.RemoverItemPedidoAsync(itemId);
            return Ok();
        }

        [HttpPatch("pedido/{pedidoId}/desconto")]
        public async Task<IActionResult> AplicarDesconto(int pedidoId, [FromBody] DescontoRequest request)
        {
            await _mesaService.AplicarDescontoAsync(pedidoId, request.Desconto);
            return Ok();
        }

        [HttpGet("produtos/{lojaId}")]
        public async Task<IActionResult> ListarProdutosLoja(Guid lojaId)
        {
            var produtos = await _mesaService.ListarProdutosLojaAsync(lojaId);
            return Ok(produtos);
        }

        [HttpPost("pedido/{pedidoId}/item")]
        public async Task<IActionResult> AdicionarItem(int pedidoId, [FromBody] AdicionarItemRequest request)
        {
            await _mesaService.AdicionarItemPedidoAsync(pedidoId, request.ProdutoLojaId, request.Quantidade);
            return Ok();
        }

        [HttpPatch("pedido-item/{itemId}/status")]
        public async Task<IActionResult> AtualizarStatusItem(int itemId, [FromBody] string status)
        {
            await _mesaService.AtualizarStatusItemPedidoAsync(itemId, status);
            return Ok();
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

    public class DescontoRequest
    {
        public int Desconto { get; set; }
    }

    public class AdicionarItemRequest
    {
        public int ProdutoLojaId { get; set; }
        public int Quantidade { get; set; } = 1;
    }
}
