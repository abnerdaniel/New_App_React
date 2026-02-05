using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;

namespace Controle.Infrastructure.Repositories
{
    public class CardapioRepository : ICardapioRepository
    {
        private readonly AppDbContext _context;

        public CardapioRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Cardapio cardapio)
        {
            await _context.Set<Cardapio>().AddAsync(cardapio);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var cardapio = await _context.Set<Cardapio>().FindAsync(id);
            if (cardapio != null)
            {
                _context.Set<Cardapio>().Remove(cardapio);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Cardapio>> GetAllAsync()
        {
            return await _context.Set<Cardapio>()
                                 .Include(c => c.Categorias)
                                 .ToListAsync();
        }

        public async Task<Cardapio?> GetByIdAsync(int id)
        {
            return await _context.Set<Cardapio>()
                                 .Include(c => c.Categorias)
                                 .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Cardapio>> GetByLojaIdAsync(Guid lojaId)
        {
            return await _context.Set<Cardapio>()
                                 .Where(c => c.LojaId == lojaId)
                                 .Include(c => c.Categorias)
                                 .ToListAsync();
        }

        public async Task UpdateAsync(Cardapio cardapio)
        {
            _context.Set<Cardapio>().Update(cardapio);
            await _context.SaveChangesAsync();
        }
    }
}
