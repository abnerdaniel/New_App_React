using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/transacao")]
    [DisplayName("Gestão de transacao")]
    public class TransacoesController : ControllerBase
    {
        private readonly ITransacaoService _service;
        public TransacoesController(ITransacaoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Cria uma nova transacao no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        /// - Descricao
        /// - Valor inteiro exemplo: 1000 para R$10,00
        /// - Tipo (despesa ou receita)
        /// - PessoaId
        /// - CategoriaId
        ///
        /// </remarks>
        /// <response code="201">Transacao criada com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        [HttpPost("criar")]
        [ProducesResponseType(typeof(TransacaoResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> Post([FromBody] TransacaoRequest transacaoRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var transacao = new Transacao
            {
                Descricao = transacaoRequest.Descricao,
                Valor = transacaoRequest.Valor,
                Tipo = transacaoRequest.Tipo,
                PessoaId = transacaoRequest.PessoaId,
                CategoriaId = transacaoRequest.CategoriaId
            };
            var result = await _service.CriarTransacaoAsync(transacao);
            if (result.Success == false)
                return BadRequest(result);
            return CreatedAtAction(nameof(Get) , new {id = transacao.Id}, transacao);
        }

        /// <summary>
        /// Lista todas transacoes do sistema por pessoa.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        /// - PessoaId
        ///
        /// </remarks>
        /// <response code="200">Lista carregada com sucesso.</response>
        /// <response code="404">Lista nao encontrada.</response>
        [HttpGet("lista/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var transacoes = await _service.ObterTodasTransacoesPorPessoaIdAsync(id);
            if (transacoes == null || !transacoes.Any())
            {
                return NotFound();
            }
            return Ok(transacoes);  
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
        [ProducesResponseType(typeof(TransacaoResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(int id)
        {
            var transacoes = await _service.ObterTransacaoPorIdAsync(id);
            if (transacoes == null)
            {
                return NotFound();
            }
            await _service.DeletarTransacaoAsync(id);
            return Ok(transacoes);
        }
    }
}