using Microsoft.AspNetCore.Mvc;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutoLojaController : ControllerBase
    {
        private readonly IProdutoLojaService _produtoLojaService;

        public ProdutoLojaController(IProdutoLojaService produtoLojaService)
        {
            _produtoLojaService = produtoLojaService;
        }

        [HttpPost]
        public async Task<IActionResult> AdicionarProdutoLoja([FromBody] CreateProdutoLojaRequest dto)
        {
            try
            {
                var produtoLoja = await _produtoLojaService.AdicionarProdutoLojaAsync(dto);
                return CreatedAtAction(nameof(AdicionarProdutoLoja), new { id = produtoLoja.Id }, produtoLoja);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("loja/{lojaId}/estoque")]
        public async Task<IActionResult> ObterEstoquePorLoja(Guid lojaId)
        {
            var estoque = await _produtoLojaService.ObterEstoquePorLojaAsync(lojaId);
            return Ok(estoque);
        }
    }
}
