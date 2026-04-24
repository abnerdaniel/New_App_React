using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;

namespace Controle.Infrastructure.Repositories
{
    public class ProdutoLojaRepository : IProdutoLojaRepository
    {
        private readonly AppDbContext _context;

        public ProdutoLojaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProdutoLoja> AddAsync(ProdutoLoja produtoLoja)
        {
            await _context.ProdutosLojas.AddAsync(produtoLoja);
            await _context.SaveChangesAsync();
            return produtoLoja;
        }

        public async Task RemoveAsync(ProdutoLoja produtoLoja)
        {
            // Remover referências a este produto nos combos
            var combosVinculados = await _context.Set<ComboEtapaOpcao>()
                .Where(c => c.ProdutoLojaId == produtoLoja.Id)
                .ToListAsync();
                
            if (combosVinculados.Any())
            {
                _context.Set<ComboEtapaOpcao>().RemoveRange(combosVinculados);
            }

            var comboItemsVinculados = await _context.Set<ComboItem>()
                .Where(c => c.ProdutoLojaId == produtoLoja.Id)
                .ToListAsync();
            
            if (comboItemsVinculados.Any())
            {
                _context.Set<ComboItem>().RemoveRange(comboItemsVinculados);
            }

            // Desvincular de PedidoItem para histórico não apitar Restrict (Set Nulo)
            var pedidosHistory = await _context.Set<PedidoItem>()
                .Where(p => p.ProdutoLojaId == produtoLoja.Id)
                .ToListAsync();
            foreach (var p in pedidosHistory) p.ProdutoLojaId = null;

            // Anular ProdutoVarianteId nos Pedidos (para permitir exclusão das Variantes)
            var variantesDoProdutoIds = await _context.Set<ProdutoVariante>()
                .Where(v => v.ProdutoLojaId == produtoLoja.Id).Select(v => v.Id).ToListAsync();
            var pedidosVariantesHistory = await _context.Set<PedidoItem>()
                .Where(p => p.ProdutoVarianteId.HasValue && variantesDoProdutoIds.Contains(p.ProdutoVarianteId.Value))
                .ToListAsync();
            foreach (var p in pedidosVariantesHistory) p.ProdutoVarianteId = null;

            // Remover PedidoItemOpcao amarrados a Opções do Produto
            var opcoesDoProdutoIds = await _context.Set<OpcaoItem>()
                .Where(o => o.GrupoOpcao != null && o.GrupoOpcao.ProdutoLojaId == produtoLoja.Id)
                .Select(o => o.Id).ToListAsync();
            var pedidosItemOpcaoHistory = await _context.Set<PedidoItemOpcao>()
                .Where(pio => opcoesDoProdutoIds.Contains(pio.OpcaoItemId))
                .ToListAsync();
            _context.Set<PedidoItemOpcao>().RemoveRange(pedidosItemOpcaoHistory);

            // Remover amarras de Adicionais
            var adPai = await _context.Set<ProdutoAdicional>()
                .Where(p => p.ProdutoPaiId == produtoLoja.ProdutoId).ToListAsync();
            var adFilho = await _context.Set<ProdutoAdicional>()
                .Where(p => p.ProdutoFilhoId == produtoLoja.ProdutoId).ToListAsync();
            
            _context.Set<ProdutoAdicional>().RemoveRange(adPai);
            _context.Set<ProdutoAdicional>().RemoveRange(adFilho);

            _context.ProdutosLojas.Remove(produtoLoja);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProdutoLoja>> GetAllAsync()
        {
            return await _context.ProdutosLojas.ToListAsync();
        }

        public async Task<ProdutoLoja?> GetByIdAsync(int id)
        {
            return await _context.ProdutosLojas
                .Include(pl => pl.ProdutoCategorias)
                .Include(pl => pl.TipoProduto)
                .Include(pl => pl.Imagens) // Load Imagens!
                .Include(pl => pl.Produto)
                    .ThenInclude(p => p.Adicionais)
                .Include(pl => pl.Variantes)
                    .ThenInclude(v => v.Atributos)
                .Include(pl => pl.GruposOpcao)
                    .ThenInclude(g => g.Itens)
                .FirstOrDefaultAsync(pl => pl.Id == id);
        }

        public async Task UpdateAsync(ProdutoLoja produtoLoja)
        {
            _context.ProdutosLojas.Update(produtoLoja);
            await _context.SaveChangesAsync();
        }
        public async Task<ProdutoLoja?> GetByProdutoAndLojaAsync(int produtoId, Guid lojaId)
        {
            return await _context.ProdutosLojas
                .Include(pl => pl.ProdutoCategorias)
                .Include(pl => pl.Imagens)
                .FirstOrDefaultAsync(pl => pl.ProdutoId == produtoId && pl.LojaId == lojaId);
        }

        public async Task<IEnumerable<ProdutoLoja>> GetByLojaIdAsync(Guid lojaId)
        {
            return await _context.ProdutosLojas
                .Where(pl => pl.LojaId == lojaId)
                .Include(pl => pl.ProdutoCategorias)
                .Include(pl => pl.TipoProduto)
                .Include(pl => pl.Imagens) // Load Imagens!
                .Include(pl => pl.Produto)
                    .ThenInclude(p => p.Adicionais) // Load extras!
                .AsNoTracking() // Optimization for read-only lists
                .ToListAsync();
        }
    }
}
