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

        /// <response code="201">Pedido realizado com sucesso.</response>
        /// <response code="400">Erro ao realizar pedido.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RealizarPedido([FromBody] RealizarPedidoDTO dto)
        {
            var pedido = await _pedidoService.RealizarPedidoAsync(dto);
            // Retorna 201 Created. O header Location aponta para a fila de pedidos da loja por enquanto, 
            // já que não temos um endpoint GetPedidoById específico exposto ainda (embora pudesse ser criado).
            return CreatedAtAction(nameof(ListarPedidosFila), new { lojaId = pedido.LojaId }, pedido);
        }

        /// <summary>
        /// Lista os pedidos na fila da loja (Pendentes/Em Preparo).
        /// </summary>

        /// <response code="200">Pedidos listados com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("fila/{lojaId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ListarPedidosFila(Guid lojaId)
        {
            var pedidos = await _pedidoService.ListarPedidosFilaAsync(lojaId);
            return Ok(pedidos);
        }

        /// <summary>
        /// Atualiza o status de um pedido.
        /// </summary>

        /// <response code="200">Status atualizado com sucesso.</response>
        /// <response code="400">Erro ao atualizar status.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPatch("{pedidoId}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AtualizarStatus(int pedidoId, [FromBody] string novoStatus)
        {
            var pedido = await _pedidoService.AtualizarStatusPedidoAsync(pedidoId, novoStatus);
            return Ok(pedido);
        }

        /// <summary>
        /// Cancela um pedido pelo lojista.
        /// </summary>

        /// <response code="200">Pedido cancelado com sucesso.</response>
        /// <response code="400">Erro ao cancelar pedido.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPatch("{pedidoId}/cancelar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CancelarPedido(int pedidoId, [FromBody] string motivo)
        {
            var pedido = await _pedidoService.CancelarPedidoLojistaAsync(pedidoId, motivo);
            return Ok(pedido);
        }
    }
}
