using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
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

        public async Task<List<Cardapio>> ListarPorLojaAsync(Guid lojaId)
        {
            return await _context.Cardapios
                .Where(c => c.LojaId == lojaId)
                .Include(c => c.Categorias)
                    .ThenInclude(cat => cat.Produtos)
                    .ThenInclude(pl => pl.Produto) // Para produtos normais da categoria
                        .ThenInclude(p => p.Adicionais)
                            .ThenInclude(pa => pa.ProdutoFilho)
                .Include(c => c.Categorias)
                    .ThenInclude(cat => cat.Combos)
                        .ThenInclude(cb => cb.Itens)
                            .ThenInclude(i => i.ProdutoLoja)
                                .ThenInclude(pl => pl.Produto)
                                    .ThenInclude(p => p.Adicionais)
                                        .ThenInclude(pa => pa.ProdutoFilho)
                .OrderBy(c => c.Nome)
                .ToListAsync();
        }

        public async Task<Cardapio> AtualizarCardapioAsync(int id, CreateCardapioDTO dto)
        {
            var cardapio = await _context.Cardapios.FindAsync(id);
            if (cardapio == null) throw new System.Exception("Cardápio não encontrado.");

            cardapio.Nome = dto.Nome;
            cardapio.HorarioInicio = dto.HorarioInicio;
            cardapio.HorarioFim = dto.HorarioFim;
            cardapio.DataInicio = dto.DataInicio;
            cardapio.DataFim = dto.DataFim;
            cardapio.DiasSemana = dto.DiasSemana;
            cardapio.Ativo = dto.Ativo;

            await _context.SaveChangesAsync();
            return cardapio;
        }

        public async Task ExcluirCardapioAsync(int id)
        {
            var cardapio = await _context.Cardapios.FindAsync(id);
            if (cardapio == null) throw new System.Exception("Cardápio não encontrado.");

            _context.Cardapios.Remove(cardapio);
            await _context.SaveChangesAsync();
        }
    }
}
