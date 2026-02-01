using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/cargos")]
    [Authorize]
    public class CargoController : ControllerBase
    {
        private readonly ICargoRepository _cargoRepository;

        public CargoController(ICargoRepository cargoRepository)
        {
            _cargoRepository = cargoRepository;
        }

        /// <summary>
        /// Lista todos os cargos disponíveis.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Cargo>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListarCargos()
        {
            var cargos = await _cargoRepository.GetAllAsync();
            return Ok(cargos);
        }
    }
}
