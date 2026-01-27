using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [DisplayName("Autenticação")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Realiza login no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe:
        /// - Email
        /// - Password
        /// 
        /// Retorna um token JWT para autenticação.
        /// </remarks>
        /// <response code="200">Login realizado com sucesso.</response>
        /// <response code="400">Credenciais inválidas.</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request.Login, request.Password);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(result.Data);
        }

        /// <summary>
        /// Registra um novo usuário no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe:
        /// - Nome
        /// - Email
        /// - Password
        /// 
        /// Retorna um token JWT para autenticação automática após o registro.
        /// </remarks>
        /// <response code="201">Usuário criado com sucesso.</response>
        /// <response code="400">Dados inválidos ou email já em uso.</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(request.Nome, request.Login, request.Email, request.Password);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return CreatedAtAction(nameof(GetUsuario), new { id = result.Data!.Id }, result.Data);
        }

        /// <summary>
        /// Obtém dados do usuário pelo ID.
        /// </summary>
        /// <response code="200">Usuário encontrado.</response>
        /// <response code="404">Usuário não encontrado.</response>
        [HttpGet("usuario/{id}")]
        [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUsuario(Guid id)
        {
            var usuario = await _authService.GetUsuarioByIdAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            return Ok(usuario);
        }

        /// <summary>
        /// Lista todos os usuários do sistema (Admin).
        /// </summary>
        /// <remarks>
        /// Este endpoint retorna todos os usuários cadastrados, incluindo status de ativo/inativo.
        /// Requer autenticação JWT.
        /// </remarks>
        /// <response code="200">Lista de usuários retornada com sucesso.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpGet("usuarios")]
        [Authorize] // Requer token JWT
        [ProducesResponseType(typeof(IEnumerable<UsuarioResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAllUsuarios()
        {
            var usuarios = await _authService.GetAllUsuariosAsync();
            return Ok(usuarios);
        }

        /// <summary>
        /// Ativa um usuário (Admin).
        /// </summary>
        /// <remarks>
        /// Este endpoint permite que um administrador ative um usuário que estava aguardando aprovação.
        /// Após ativação, o usuário poderá fazer login normalmente.
        /// Requer autenticação JWT.
        /// </remarks>
        /// <response code="200">Usuário ativado com sucesso.</response>
        /// <response code="400">Erro ao ativar usuário.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPut("usuario/{id}/ativar")]
        [Authorize] // Requer token JWT
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AtivarUsuario(Guid id)
        {
            var result = await _authService.AtivarUsuarioAsync(id);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(new { message = "Usuário ativado com sucesso." });
        }

        /// <summary>
        /// Desativa um usuário (Admin).
        /// </summary>
        /// <remarks>
        /// Este endpoint permite que um administrador desative um usuário.
        /// Após desativação, o usuário não poderá mais fazer login.
        /// Requer autenticação JWT.
        /// </remarks>
        /// <response code="200">Usuário desativado com sucesso.</response>
        /// <response code="400">Erro ao desativar usuário.</response>
        /// <response code="401">Não autorizado.</response>
        [HttpPut("usuario/{id}/desativar")]
        [Authorize] // Requer token JWT
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DesativarUsuario(Guid id)
        {
            var result = await _authService.DesativarUsuarioAsync(id);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Error });
            }

            return Ok(new { message = "Usuário desativado com sucesso." });
        }
    }
}