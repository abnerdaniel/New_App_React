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
    [Route("api/categorias")]
    [DisplayName("Gestão de categorias")]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriaService _service;
        public CategoriasController(ICategoriaService service) 
        {
            _service = service;
        }


        /// <summary>
        /// Lista categoria do sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        ///
        /// </remarks>
        /// <response code="200">categorias encontada.</response>
        /// <response code="404">categorias Nao encontrado.</response>
        [HttpGet("lista")]
        public async Task<IActionResult> Get()
        {
            var categorias = await _service.ObterTodasCategoriasAsync();
            if (categorias == null || !categorias.Any())
            {
                return NotFound();
            }
            return Ok(categorias);
        }

        /// <summary>
        /// Cria categoria no sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        /// - Descricao 
        /// - Finalidade  (despesa/receita/ambas)
        /// </remarks>
        /// <response code="201">Criado com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        [HttpPost("criar")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Post([FromBody] CategoriaRequest categoriaRequest)//Criar nova categoria
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Categoria novaCategoria = new Categoria
            {
                Descricao = categoriaRequest.Descricao,
                Finalidade = categoriaRequest.Finalidade
            };
            var result = await _service.CriarCategoriaAsync(novaCategoria);
            if(result.Success == false)
                return BadRequest(result);
            return CreatedAtAction(nameof(Get), new { result });
        } 
    }
}