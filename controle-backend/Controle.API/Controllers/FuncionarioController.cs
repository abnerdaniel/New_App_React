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
    [Route("api/funcionarios")]
    [DisplayName("Funcionários")]
    [Authorize] // Requer autenticação para todas as rotas
    public class FuncionarioController : ControllerBase
    {
        private readonly IFuncionarioService _funcionarioService;

        public FuncionarioController(IFuncionarioService funcionarioService)
        {
            _funcionarioService = funcionarioService;
        }

        /// <summary>
        /// Cadastra um novo funcionário (Garçom, Cozinheiro, Motoboy).
        /// </summary>
        /// <remarks>
        /// Este endpoint cria um usuário e um funcionário vinculado.
        /// O usuário é ativado automaticamente.
        /// </remarks>
        /// <response code="200">Funcionário cadastrado com sucesso.</response>
        /// <response code="400">Erro ao cadastrar funcionário.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Cadastrar([FromBody] RegisterFuncionarioRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _funcionarioService.CadastrarFuncionarioAsync(
                request.Nome, request.Email, request.Password, request.Cargo, request.LojaId);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(new { message = "Funcionário cadastrado com sucesso." });
        }

        /// <summary>
        /// Lista a equipe de uma loja específica.
        /// </summary>
        /// <param name="lojaId">ID da loja.</param>
        /// <response code="200">Lista de funcionários retornada com sucesso.</response>
        [HttpGet("loja/{lojaId}")]
        [ProducesResponseType(typeof(IEnumerable<FuncionarioDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarEquipe(int lojaId)
        {
            var equipe = await _funcionarioService.ListarEquipeAsync(lojaId);
            return Ok(equipe);
        }

        /// <summary>
        /// Bloqueia o acesso de um funcionário (Demitir).
        /// </summary>
        /// <param name="id">ID do funcionário.</param>
        /// <response code="200">Funcionário bloqueado com sucesso.</response>
        /// <response code="400">Erro ao bloquear funcionário.</response>
        [HttpPut("{id}/bloquear")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> BloquearAcesso(int id)
        {
            var result = await _funcionarioService.BloquearAcessoAsync(id);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(new { message = "Acesso do funcionário bloqueado com sucesso." });
        }
    }
}
