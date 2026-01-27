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
        /// Obtém a vitrine da loja para o cliente (cardápio ativo).
        /// </summary>
        [HttpGet("{lojaId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObterVitrine(int lojaId)
        {
            var vitrine = await _vitrineService.ObterLojaParaClienteAsync(lojaId);
            if (vitrine == null) return NotFound();
            return Ok(vitrine);
        }
    }
}
