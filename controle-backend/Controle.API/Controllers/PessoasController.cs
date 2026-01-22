using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Application.Services;
using Controle.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/pessoas")]
    [DisplayName("Gestão de Pessoas")]
    public class PessoasController : ControllerBase
    {
        private readonly IPessoaService _service;

        public PessoasController(IPessoaService service)
        {
            _service = service;
        }


        /// <summary>
        /// Busca pessoa no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        /// - Id
        ///
        /// </remarks>
        /// <response code="200">Pessoas encontada.</response>
        /// <response code="404">Nao encontrado.</response>
        [HttpGet("lista")]
        [ProducesResponseType(typeof(List<PessoaResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()//Obter pessoa por ID
        {
            var pessoa = await _service.ObterTodasPessoasAsync();
            if (pessoa == null)
            {
                return NotFound();
            }
            return Ok(pessoa);
        }
        
        /// <summary>
        /// Cria uma nova pessoa no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        /// - Nome
        /// - Email
        ///
        /// </remarks>
        /// <response code="201">Pessoa criada com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        [HttpPost("criar")]
        [ProducesResponseType(typeof(PessoaResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> Post([FromBody] PessoaRequest request)//Criar nova pessoa
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Pessoa pessoaExistente = await _service.ObterPessoaPorNomeAsync(request.Nome);
            if (pessoaExistente != null)
            {
                return CreatedAtAction(nameof(Get), new { id = pessoaExistente.Id }, pessoaExistente);
            }
            var pessoa = new Pessoa
            {
                Nome = request.Nome,
                Idade = request.Idade
            };
            
            var result = await _service.CriarPessoaAsync(pessoa);
            if (result.Success == false)
                return BadRequest(result);
            return CreatedAtAction(nameof(Get), new { id = pessoa.Id }, pessoa);
        }

        /// <summary>
        /// Atualiza dados pessoa no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para atualizar cadastro:
        /// - Id
        /// - Nome
        /// - Email
        ///
        /// </remarks>
        /// <response code="200">Dados atualizados com sucesso.</response>
        /// <response code="404">Dados nao encontrados.</response>
        /// <response code="400">Dados invalidos.</response>
        [HttpPut("atualiza")]
        [ProducesResponseType(typeof(PessoaResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> Put([FromBody] PessoaFullRequest pessoaRequest)//Atualiza dados pessoa
        {
            Pessoa pessoa = new Pessoa
            {
                Id = pessoaRequest.Id,
                Nome = pessoaRequest.Nome,
                Idade = pessoaRequest.Idade
            };
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var pessoaR = await _service.ObterPessoaPorIdAsync(pessoa.Id);
            if (pessoaR == null)
            {
                return NotFound();
            }
            
            await _service.AtualizarPessoaAsync(pessoa);
            return Ok(pessoaR);
        }

        /// <summary>
        /// Deleta dados no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para deletar o cadastro completamente:
        /// - Id
        ///
        /// </remarks>
        /// <response code="200">Deletado com sucesso.</response>
        /// <response code="404">Dados nao encontrados.</response>
        [HttpDelete("deleta/{id}")]
        [ProducesResponseType(typeof(PessoaResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(int id)
        {
            var pessoa = await _service.ObterPessoaPorIdAsync(id);
            if (pessoa == null)
            {
                return NotFound();
            }

            await _service.DeletarPessoaAsync(id);
            return Ok(pessoa);
        }
    }
}