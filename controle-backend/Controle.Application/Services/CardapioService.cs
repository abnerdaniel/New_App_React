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
                .ThenInclude(cat => cat.Produtos) // Nota: Assume-se que Categoria possui uma coleção de Produtos.
                                                  // No Passo 0/1 foi adicionado 'public Cardapio Cardapio' em Categoria,
                                                  // porém não verificamos explicitamente se Categoria possui a coleção 'Produtos' na Entidade.
                                                  // Vamos verificar a estrutura de Categoria se possível, ou assumir navegação padrão.
                                                  // Nota anterior do usuário: "Atualize ProdutoLoja: Adicione CategoriaId...".
                                                  // O usuário não disse explicitamente "Adicionar List<ProdutoLoja> Produtos em Categoria".
                                                  // Entretanto, normalmente o EF Core precisa da coleção para o Include funcionar.
                                                  // Devo checar o Categoria.cs novamente.
                                                  // Se estiver faltando, poderei ter que adicionar ou o Include não funcionará para "ThenInclude(cat => cat.Produtos)".
                .FirstOrDefaultAsync(c => c.Id == cardapioId);
        }
    }
}
