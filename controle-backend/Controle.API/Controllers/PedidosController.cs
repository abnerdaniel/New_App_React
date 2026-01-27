using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/pedidos")]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidosController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        /// <summary>
        /// Realiza um novo pedido.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RealizarPedido([FromBody] RealizarPedidoDTO dto)
        {
            var pedido = await _pedidoService.RealizarPedidoAsync(dto);
            // Retorna 201 Created. O Location header aponta para a fila de pedidos da loja por enquanto, 
            // já que não temos um endpoint GetPedidoById específico exposto ainda (embora pudesse ser criado).
            return CreatedAtAction(nameof(ListarPedidosFila), new { lojaId = pedido.LojaId }, pedido);
        }

        /// <summary>
        /// Lista os pedidos na fila da loja (Pendentes/Em Preparo).
        /// </summary>
        [HttpGet("fila/{lojaId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarPedidosFila(Guid lojaId)
        {
            var pedidos = await _pedidoService.ListarPedidosFilaAsync(lojaId);
            return Ok(pedidos);
        }

        /// <summary>
        /// Atualiza o status de um pedido.
        /// </summary>
        [HttpPatch("{pedidoId}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AtualizarStatus(int pedidoId, [FromBody] string novoStatus)
        {
            var pedido = await _pedidoService.AtualizarStatusPedidoAsync(pedidoId, novoStatus);
            return Ok(pedido);
        }

        /// <summary>
        /// Cancela um pedido pelo lojista.
        /// </summary>
        [HttpPatch("{pedidoId}/cancelar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CancelarPedido(int pedidoId, [FromBody] string motivo)
        {
            var pedido = await _pedidoService.CancelarPedidoLojistaAsync(pedidoId, motivo);
            return Ok(pedido);
        }
    }
}
