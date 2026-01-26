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
    public class BloqueiosRepository : IBloqueiosRepository
    {
        private readonly AppDbContext _context;

        public BloqueiosRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Bloqueios bloqueios)
        {
            await _context.Bloqueios.AddAsync(bloqueios);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var bloqueios = await _context.Bloqueios.FindAsync(id);
            if (bloqueios != null)
            {
                _context.Bloqueios.Remove(bloqueios);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Bloqueios>> GetAllAsync()
        {
            return await _context.Bloqueios.ToListAsync();
        }

        public async Task<Bloqueios?> GetByIdAsync(int id)
        {
            return await _context.Bloqueios.FindAsync(id);
        }

        public async Task UpdateAsync(Bloqueios bloqueios)
        {
            _context.Bloqueios.Update(bloqueios);
            await _context.SaveChangesAsync();
        }
    }
}
