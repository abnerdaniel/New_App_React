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
        /// Registra um novo cliente final.
        /// </summary>
        /// <response code="201">Cliente registrado com sucesso.</response>
        /// <response code="400">Dados inválidos ou email já cadastrado.</response>
        [HttpPost("cadastro")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ClienteLoginResponseDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] ClienteRegisterDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clienteService.RegisterAsync(dto);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return StatusCode(StatusCodes.Status201Created, result.Data);
        }

        /// <summary>
        /// Realiza login do cliente final.
        /// </summary>
        /// <response code="200">Login realizado com sucesso.</response>
        /// <response code="400">Credenciais inválidas.</response>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ClienteLoginResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] ClienteLoginDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clienteService.LoginAsync(dto);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(result.Data);
        }

        /// <summary>
        /// Realiza login do cliente usando o Google.
        /// </summary>
        /// <response code="200">Login realizado com sucesso.</response>
        /// <response code="400">Token inválido ou erro no processo.</response>
        [HttpPost("google-login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ClienteLoginResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> LoginWithGoogle([FromBody] ClienteGoogleLoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clienteService.LoginWithGoogleAsync(request.IdToken);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(result.Data);
        }

        /// <summary>
        /// Adiciona um novo endereço para o cliente.
        /// </summary>
        /// <param name="clienteId">ID do cliente.</param>
        /// <param name="enderecoDto">Dados do endereço.</param>
        /// <response code="200">Endereço adicionado com sucesso.</response>
        /// <response code="400">Erro ao adicionar endereço.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPost("{clienteId}/enderecos")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
        /// <response code="401">Não autorizado.</response>
        [HttpGet("{clienteId}/enderecos")]
        [ProducesResponseType(typeof(IEnumerable<EnderecoDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ListarEnderecos(int clienteId)
        {
            var enderecos = await _clienteService.ListarEnderecosAsync(clienteId);
            return Ok(enderecos);
        }

        /// <summary>
        /// Atualiza um endereço existente.
        /// </summary>
        [HttpPut("{clienteId}/enderecos/{enderecoId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AtualizarEndereco(int clienteId, int enderecoId, [FromBody] EnderecoDTO enderecoDto)
        {
            if (enderecoId != enderecoDto.Id && enderecoDto.Id != 0) return BadRequest("ID do endereço inconsistente.");
            
            enderecoDto.Id = enderecoId; // Garante ID correto
            var result = await _clienteService.AtualizarEnderecoAsync(clienteId, enderecoDto);

            if (!result.Success) return BadRequest(new { message = result.Error });

            return Ok(new { message = "Endereço atualizado com sucesso." });
        }

        /// <summary>
        /// Remove um endereço.
        /// </summary>
        [HttpDelete("{clienteId}/enderecos/{enderecoId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RemoverEndereco(int clienteId, int enderecoId)
        {
            var result = await _clienteService.RemoverEnderecoAsync(clienteId, enderecoId);

            if (!result.Success) return BadRequest(new { message = result.Error });

            return Ok(new { message = "Endereço removido com sucesso." });
        }

        /// <summary>
        /// Obtém o histórico de pedidos de um cliente.
        /// </summary>
        /// <param name="clienteId">ID do cliente.</param>
        /// <response code="200">Histórico de pedidos retornado com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("{clienteId}/historico")]
        [ProducesResponseType(typeof(IEnumerable<PedidoHistoricoDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetHistoricoPedidos(int clienteId)
        {
            var historico = await _clienteService.GetHistoricoPedidosAsync(clienteId);
            return Ok(historico);
        }
    }
}
