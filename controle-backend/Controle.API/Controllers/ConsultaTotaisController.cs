using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/consultaTotais")]
    [DisplayName("Consulta de totais")]
    public class ConsultaTotaisController : ControllerBase
    {
        private readonly IConsultaTotaisService _consultaTotaisService;
        public ConsultaTotaisController(IConsultaTotaisService consultaTotaisService) 
        {
            _consultaTotaisService = consultaTotaisService;
        }


        /// <summary>
        /// Lista total de valor do sistema.
        /// </summary>
        /// <remarks>
        /// Este endpoint recebe apenas os dados essenciais para cadastro:
        ///
        /// </remarks>
        /// <response code="200">Lista encontada.</response>
        /// <response code="404">Lista Nao encontrado.</response>
        [HttpGet("lista")]
        [ProducesResponseType(typeof(ListaPessoasResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            var lista = await _consultaTotaisService.ConsultaTotalPorPessoa();
            if (lista == null )
            {
                return NotFound();
            }
            return Ok(lista);
        }
    }
}