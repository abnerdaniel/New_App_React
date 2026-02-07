using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/vitrine")]
    [AllowAnonymous] // Permite acesso público para visualização do cardápio
    public class VitrineController : ControllerBase
    {
        private readonly IVitrineService _vitrineService;

        public VitrineController(IVitrineService vitrineService)
        {
            _vitrineService = vitrineService;
        }

        /// <summary>
        /// Lista todas as lojas ativas para a home page do cliente.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarLojas()
        {
            var lojas = await _vitrineService.ListarLojasAtivasAsync();
            return Ok(lojas);
        }

        /// <summary>
        /// Obtém a vitrine da loja para o cliente (cardápio ativo).
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObterVitrine(string id)
        {
            var vitrine = await _vitrineService.ObterLojaParaClienteAsync(id);
            if (vitrine == null) return NotFound();
            return Ok(vitrine);
        }
    }
}
