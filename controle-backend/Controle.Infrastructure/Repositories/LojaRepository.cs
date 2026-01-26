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
    public class LojaRepository : ILojaRepository
    {
        private readonly AppDbContext _context;

        public LojaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Loja loja)
        {
            await _context.Lojas.AddAsync(loja);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var loja = await _context.Lojas.FindAsync(id);
            if (loja != null)
            {
                _context.Lojas.Remove(loja);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Loja>> GetAllAsync()
        {
            return await _context.Lojas.ToListAsync();
        }

        public async Task<Loja?> GetByIdAsync(int id)
        {
            return await _context.Lojas.FindAsync(id);
        }

        public async Task UpdateAsync(Loja loja)
        {
            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();
        }
    }
}
