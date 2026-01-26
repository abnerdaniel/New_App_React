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

        public async Task AddAsync(ProdutoLoja produtoLoja)
        {
            await _context.ProdutosLojas.AddAsync(produtoLoja);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var produtoLoja = await _context.ProdutosLojas.FindAsync(id);
            if (produtoLoja != null)
            {
                _context.ProdutosLojas.Remove(produtoLoja);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<ProdutoLoja>> GetAllAsync()
        {
            return await _context.ProdutosLojas.ToListAsync();
        }

        public async Task<ProdutoLoja?> GetByIdAsync(int id)
        {
            return await _context.ProdutosLojas.FindAsync(id);
        }

        public async Task UpdateAsync(ProdutoLoja produtoLoja)
        {
            _context.ProdutosLojas.Update(produtoLoja);
            await _context.SaveChangesAsync();
        }
    }
}
