using Microsoft.AspNetCore.Mvc;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AIIntegrationController : ControllerBase
    {
        private readonly ILojaRepository _lojaRepository;
        private readonly IProdutoService _produtoService;
        private readonly IProdutoLojaService _produtoLojaService;
        private readonly IConfiguration _configuration;

        public AIIntegrationController(
            ILojaRepository lojaRepository,
            IProdutoService produtoService,
            IProdutoLojaService produtoLojaService,
            IConfiguration configuration)
        {
            _lojaRepository = lojaRepository;
            _produtoService = produtoService;
            _produtoLojaService = produtoLojaService;
            _configuration = configuration;
        }

        [HttpPost("produtos")]
        public async Task<IActionResult> AdicionarProdutoIA([FromBody] AIPayloadProdutoRequest payload, [FromHeader(Name = "X-AI-API-KEY")] string aiKey)
        {
            // 1. Validação da Chave da IA
            var expectedKey = _configuration["AiSettings:ApiKey"];
            if (string.IsNullOrEmpty(expectedKey) || aiKey != expectedKey)
            {
                return Unauthorized(new { message = "Chave da IA inválida ou não configurada." });
            }

            // 2. Busca da Loja pelo Telefone
            var loja = await _lojaRepository.GetByTelefoneAsync(payload.TelefoneLoja);
            if (loja == null)
            {
                return BadRequest(new { message = "Loja não encontrada para este telefone." });
            }

            // 3. Buscar se já existe produto global compatível
            var produtosGlobais = await _produtoService.ObterTodosAsync();
            var produtoCorrespondente = produtosGlobais.FirstOrDefault(p => p.Nome.Equals(payload.Nome, System.StringComparison.OrdinalIgnoreCase));

            // 4. Montar a requisição final
            var request = new CreateProdutoLojaRequest
            {
                LojaId = loja.Id,
                Preco = payload.Preco,
                Estoque = payload.Estoque ?? 0,
                Disponivel = payload.Disponivel,
                CategoriaId = payload.CategoriaId,
                ImagemUrl = payload.ImagemUrl
            };

            if (produtoCorrespondente != null)
            {
                request.ProdutoId = produtoCorrespondente.Id;
            }
            else
            {
                request.NovoProduto = new CreateProdutoDTO
                {
                    Nome = payload.Nome,
                    Descricao = payload.Descricao,
                    Tipo = !string.IsNullOrEmpty(payload.Tipo) ? payload.Tipo : "Lanche", // Tipo padrão caso venha vazio
                    ImagemUrl = payload.ImagemUrl
                };
            }

            // 5. Cadastrar na loja
            try
            {
                var produtoLoja = await _produtoLojaService.AdicionarProdutoLojaAsync(request);
                return Created("", new { message = "Produto cadastrado com sucesso", produtoLojaId = produtoLoja.Id });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
