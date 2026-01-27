using System.Collections.Generic;
using System.ComponentModel;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/clientes")]
    [DisplayName("Área do Cliente")]
    [Authorize]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        /// <summary>
        /// Adiciona um novo endereço para o cliente.
        /// </summary>
        /// <param name="clienteId">ID do cliente.</param>
        /// <param name="enderecoDto">Dados do endereço.</param>
        /// <response code="200">Endereço adicionado com sucesso.</response>
        /// <response code="400">Erro ao adicionar endereço.</response>
        [HttpPost("{clienteId}/enderecos")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AdicionarEndereco(int clienteId, [FromBody] EnderecoDTO enderecoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clienteService.AdicionarEnderecoAsync(clienteId, enderecoDto);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(new { message = "Endereço adicionado com sucesso." });
        }

        /// <summary>
        /// Lista todos os endereços de um cliente.
        /// </summary>
        /// <param name="clienteId">ID do cliente.</param>
        /// <response code="200">Lista de endereços retornada com sucesso.</response>
        [HttpGet("{clienteId}/enderecos")]
        [ProducesResponseType(typeof(IEnumerable<EnderecoDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarEnderecos(int clienteId)
        {
            var enderecos = await _clienteService.ListarEnderecosAsync(clienteId);
            return Ok(enderecos);
        }

        /// <summary>
        /// Obtém o histórico de pedidos de um cliente.
        /// </summary>
        /// <param name="clienteId">ID do cliente.</param>
        /// <response code="200">Histórico de pedidos retornado com sucesso.</response>
        [HttpGet("{clienteId}/historico")]
        [ProducesResponseType(typeof(IEnumerable<PedidoHistoricoDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistoricoPedidos(int clienteId)
        {
            var historico = await _clienteService.GetHistoricoPedidosAsync(clienteId);
            return Ok(historico);
        }
    }
}
