using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using System.ComponentModel;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/funcionarios")]
    [DisplayName("Gestão de Funcionários")]
    [Authorize] // Requer Auth (Token do Dono/Gerente)
    public class FuncionariosController : ControllerBase
    {
        private readonly IFuncionarioService _funcionarioService;

        public FuncionariosController(IFuncionarioService funcionarioService)
        {
            _funcionarioService = funcionarioService;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Cadastrar([FromBody] RegisterFuncionarioRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _funcionarioService.CadastrarFuncionarioAsync(
                request.Nome, 
                request.Email, 
                request.Login, 
                request.Password, 
                request.Cargo, 
                request.LojaId
            );

            if (!result.Success) return BadRequest(new { message = result.Error });

            return Ok(new { message = "Funcionário cadastrado com sucesso." });
        }

        [HttpGet("loja/{lojaId}")]
        [ProducesResponseType(typeof(IEnumerable<FuncionarioDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Listar(Guid lojaId)
        {
            var equipe = await _funcionarioService.ListarEquipeAsync(lojaId);
            return Ok(equipe);
        }

        [HttpPut("{id}/bloquear")]
        public async Task<IActionResult> Bloquear(int id)
        {
            var result = await _funcionarioService.BloquearAcessoAsync(id);
            if (!result.Success) return BadRequest(new { message = result.Error });
            return Ok();
        }

        [HttpPut("{id}/desbloquear")]
        public async Task<IActionResult> Desbloquear(int id)
        {
            var result = await _funcionarioService.DesbloquearAcessoAsync(id);
            if (!result.Success) return BadRequest(new { message = result.Error });
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] UpdateFuncionarioRequest request)
        {
            var result = await _funcionarioService.AtualizarFuncionarioAsync(id, request.Nome, request.Email, request.Login, request.Cargo);
            if (!result.Success) return BadRequest(new { message = result.Error });
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var result = await _funcionarioService.ExcluirFuncionarioAsync(id);
             if (!result.Success) return BadRequest(new { message = result.Error });
            return Ok();
        }

        [HttpPut("{id}/senha")]
        public async Task<IActionResult> AlterarSenha(int id, [FromBody] AlterarSenhaRequest request)
        {
             var result = await _funcionarioService.AlterarSenhaAsync(id, request.NovaSenha);
             if (!result.Success) return BadRequest(new { message = result.Error });
             return Ok();
        }
    }

    public class RegisterFuncionarioRequest
    {
        public required string Nome { get; set; }
        public required string Email { get; set; }
        public required string Login { get; set; }
        public required string Password { get; set; }
        public required string Cargo { get; set; }
        public Guid LojaId { get; set; }
    }

    public class UpdateFuncionarioRequest
    {
        public required string Nome { get; set; }
        public required string Email { get; set; }
        public required string Login { get; set; }
        public required string Cargo { get; set; }
    }

    public class AlterarSenhaRequest
    {
        public required string NovaSenha { get; set; }
    }
}
