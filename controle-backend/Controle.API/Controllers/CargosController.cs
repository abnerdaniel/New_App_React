using Microsoft.AspNetCore.Mvc;
using Controle.Domain.Interfaces;
using Controle.Domain.Entities;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/cargos")]
    public class CargosController : ControllerBase
    {
        private readonly ICargoRepository _cargoRepository;

        public CargosController(ICargoRepository cargoRepository)
        {
            _cargoRepository = cargoRepository;
        }

        /// <summary>
        /// Lista todos os cargos disponíveis.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cargo>>> GetCargos()
        {
            try 
            {
                var cargos = await _cargoRepository.GetAllAsync();
                return Ok(cargos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno ao buscar cargos.", error = ex.Message });
            }
        }
    }
}
