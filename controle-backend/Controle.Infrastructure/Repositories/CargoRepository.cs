using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Infrastructure.Repositories
{
    public class CargoRepository : ICargoRepository
    {
        private readonly AppDbContext _context;

        public CargoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Cargo>> GetAllAsync()
        {
            return await _context.Cargos.ToListAsync();
        }

        public async Task<Cargo> GetByIdAsync(int id)
        {
            return await _context.Cargos.FindAsync(id);
        }

        public async Task<Cargo> GetByNameAsync(string nome)
        {
            return await _context.Cargos.FirstOrDefaultAsync(c => c.Nome == nome);
        }

        public async Task AddAsync(Cargo cargo)
        {
            await _context.Cargos.AddAsync(cargo);
            await _context.SaveChangesAsync();
        }
    }
}
