using System;
using System.Threading.Tasks;
using System.Linq;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/superadmin")]
    [Authorize]
    public class SuperAdminController : ControllerBase
    {
        private readonly ILojaService _lojaService;
        private readonly ILojaRepository _lojaRepository;

        public SuperAdminController(ILojaService lojaService, ILojaRepository lojaRepository)
        {
            _lojaService = lojaService;
            _lojaRepository = lojaRepository;
        }

        private bool IsSuperAdmin()
        {
            var emailClaim = User.Claims.FirstOrDefault(c => 
                c.Type == System.Security.Claims.ClaimTypes.Email || 
                c.Type == "email" || 
                c.Type.Contains("emailaddress", StringComparison.OrdinalIgnoreCase)
            );
            
            var email = emailClaim?.Value?.Trim().ToLower();

            return email == "abreu651@gmail.com" || email == "eu@eu.com"; 
        }

        /// <summary>
        /// Lista todas as lojas com informações financeiras e de licença para o SuperAdmin.
        /// </summary>
        [HttpGet("lojas")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ListarTodasLojas()
        {
            if (!IsSuperAdmin()) return Forbid();

            var lojas = await _lojaRepository.GetAllAsync();
            var result = lojas.Select(l => new 
            {
                l.Id,
                l.Nome,
                l.CpfCnpj,
                l.Email,
                l.Ativo,
                l.DataCriacao,
                l.LicencaValidaAte,
                l.BloqueadaPorFaltaDePagamento,
                l.UrlComprovantePagamento
            }).OrderByDescending(l => l.DataCriacao).ToList();

            return Ok(result);
        }

        /// <summary>
        /// Atualiza os dados de licença e bloqueio de uma loja específica.
        /// </summary>
        [HttpPatch("lojas/{lojaId}/licenca")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AtualizarLicencaLoja(Guid lojaId, [FromBody] UpdateLicencaLojaDTO dto)
        {
            if (!IsSuperAdmin()) return Forbid();

            var loja = await _lojaRepository.GetByIdAsync(lojaId);
            if (loja == null) return NotFound();

            loja.LicencaValidaAte = dto.LicencaValidaAte;
            loja.BloqueadaPorFaltaDePagamento = dto.BloqueadaPorFaltaDePagamento;
            
            if (dto.UrlComprovantePagamento != null)
                loja.UrlComprovantePagamento = dto.UrlComprovantePagamento;

            await _lojaRepository.UpdateAsync(loja);

            return Ok(new 
            {
                loja.Id,
                loja.Nome,
                loja.LicencaValidaAte,
                loja.BloqueadaPorFaltaDePagamento,
                loja.UrlComprovantePagamento
            });
        }
    }
}
