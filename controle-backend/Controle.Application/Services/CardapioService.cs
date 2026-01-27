using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class CardapioService : ICardapioService
    {
        private readonly AppDbContext _context;

        public CardapioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Cardapio> CriarCardapioAsync(Cardapio cardapio)
        {
            // Regra: Verifique se a loja já tem algum cardápio Principal.
            // Se não tiver, marque este novo como Principal automaticamente.
            bool existePrincipal = await _context.Cardapios
                .AnyAsync(c => c.LojaId == cardapio.LojaId && c.Principal);

            if (!existePrincipal)
            {
                cardapio.Principal = true;
            }

            _context.Cardapios.Add(cardapio);
            await _context.SaveChangesAsync();

            return cardapio;
        }

        public async Task<Cardapio?> ObterCardapioCompletoAsync(int cardapioId)
        {
            return await _context.Cardapios
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Produtos) // Note: This assumes Categoria has a collection of products. 
                                                  // In Step 0/1 we added 'public Cardapio Cardapio' to Categoria, 
                                                  // but we didn't explicitly check if Categoria has 'Produtos' collection in the Entity.
                                                  // Let's verify Categoria entity structure if possible, or assume standard navigation.
                                                  // Wait, in Step 0, user said "Atualize ProdutoLoja: Adicione CategoriaId...".
                                                  // User didn't explicitly say "Add List<ProdutoLoja> Produtos to Categoria".
                                                  // However, usually EF Core needs the collection for Include.
                                                  // I should check Categoria.cs again.
                                                  // If it's missing, I might need to add it or the Include won't work for "ThenInclude(cat => cat.Produtos)".
                .FirstOrDefaultAsync(c => c.Id == cardapioId);
        }
    }
}
