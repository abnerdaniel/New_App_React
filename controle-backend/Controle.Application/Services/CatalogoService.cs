using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class CatalogoService : ICatalogoService
    {
        private readonly AppDbContext _context;

        public CatalogoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProdutoLoja> AdicionarProdutoNaLojaAsync(Guid lojaId, int produtoGlobalId, int categoriaId, decimal preco, int estoque)
        {
            // Regra de Segurança: Valide se a CategoriaId informada realmente pertence a um Cardápio daquela LojaId
            var categoria = await _context.Categorias
                .Include(c => c.Cardapio)
                .FirstOrDefaultAsync(c => c.Id == categoriaId);

            if (categoria == null)
            {
                throw new DomainException("Categoria não encontrada.");
            }

            if (categoria.Cardapio == null || categoria.Cardapio.LojaId != lojaId)
            {
                throw new DomainException("A categoria informada não pertence a um cardápio desta loja.");
            }

            var produtoLoja = new ProdutoLoja
            {
                LojaId = lojaId,
                ProdutoId = produtoGlobalId,
                CategoriaId = categoriaId,
                Preco = (int)preco, // Assuming int stores the price (possibly in cents or raw unit), casting as per entity definition.
                Estoque = estoque,
                QuantidadeEstoque = estoque // Mapping 'Estoque' to 'QuantidadeEstoque' as well if needed, or just one. 
                                            // Entity has both 'Estoque' and 'QuantidadeEstoque'. 
                                            // I will set both to be safe or just 'Estoque' if that's the main one.
                                            // Looking at ProdutoLoja.cs in Step 17, it has both. I'll set both.
            };

            _context.ProdutosLojas.Add(produtoLoja);
            await _context.SaveChangesAsync();

            return produtoLoja;
        }
    }
}
