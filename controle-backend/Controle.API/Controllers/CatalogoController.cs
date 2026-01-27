using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/catalogo")]
    [Authorize]
    public class CatalogoController : ControllerBase
    {
        private readonly ICatalogoService _catalogoService;

        public CatalogoController(ICatalogoService catalogoService)
        {
            _catalogoService = catalogoService;
        }

        /// <summary>
        /// Adiciona um produto ao catálogo da loja.
        /// </summary>
        [HttpPost("produtos-loja")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AdicionarProdutoLoja([FromBody] AdicionarProdutoLojaDTO dto)
        {
            var produtoLoja = await _catalogoService.AdicionarProdutoNaLojaAsync(
                dto.LojaId,
                dto.ProdutoGlobalId,
                dto.CategoriaId,
                dto.Preco,
                dto.Estoque
            );
            return Ok(produtoLoja);
        }
    }
}
