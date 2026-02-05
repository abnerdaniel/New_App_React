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
    public class ClienteFinalRepository : IClienteFinalRepository
    {
        private readonly AppDbContext _context;

        public ClienteFinalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ClienteFinal clienteFinal)
        {
            await _context.CientesFinais.AddAsync(clienteFinal);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var clienteFinal = await _context.CientesFinais.FindAsync(id);
            if (clienteFinal != null)
            {
                _context.CientesFinais.Remove(clienteFinal);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<ClienteFinal>> GetAllAsync()
        {
            return await _context.CientesFinais.ToListAsync();
        }

        public async Task<ClienteFinal?> GetByIdAsync(int id)
        {
            return await _context.CientesFinais.FindAsync(id);
        }

        public async Task UpdateAsync(ClienteFinal clienteFinal)
        {
            _context.CientesFinais.Update(clienteFinal);
            await _context.SaveChangesAsync();
        }
    }
}
