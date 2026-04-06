using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Controle.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/n8n")]
    [AllowAnonymous]
    public class N8nController : ControllerBase
    {
        private readonly ILojaRepository _lojaRepository;

        public N8nController(ILojaRepository lojaRepository)
        {
            _lojaRepository = lojaRepository;
        }

        [HttpGet("loja-por-telefone/{telefone}")]
        public async Task<IActionResult> GetLojaByTelefone(string telefone)
        {
            if (string.IsNullOrEmpty(telefone)) return BadRequest();
            
            string searchPhone = telefone.Replace("+", "").Replace("-", "").Replace(" ", "").Replace("(", "").Replace(")", "");
            if (searchPhone.StartsWith("55")) searchPhone = searchPhone.Substring(2);

            var lojas = await _lojaRepository.GetAllAsync();
            
            var loja = lojas.FirstOrDefault(l => {
                var dbPhone = (l.Telefone ?? l.WhatsApp ?? "").Replace("+", "").Replace("-", "").Replace(" ", "").Replace("(", "").Replace(")", "");
                if (dbPhone.StartsWith("0")) dbPhone = dbPhone.Substring(1);
                return dbPhone == searchPhone;
            });

            if (loja == null) return NotFound(new { message = "Loja não encontrada para este telefone" });

            return Ok(new { 
                id = loja.Id,
                nome = loja.Nome,
                slug = loja.Slug,    // O N8N pode precisar do Identifier/Slug para montar URLs
                telefone = loja.Telefone,
                status = loja.EvolutionConnectionStatus
            });
        }
    }
}
