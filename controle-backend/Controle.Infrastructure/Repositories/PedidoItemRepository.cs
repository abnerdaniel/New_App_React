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
    public class PedidoItemRepository : IPedidoItemRepository
    {
        private readonly AppDbContext _context;

        public PedidoItemRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(PedidoItem pedidoItem)
        {
            await _context.PedidoItems.AddAsync(pedidoItem);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var pedidoItem = await _context.PedidoItems.FindAsync(id);
            if (pedidoItem != null)
            {
                _context.PedidoItems.Remove(pedidoItem);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<PedidoItem>> GetAllAsync()
        {
            return await _context.PedidoItems.ToListAsync();
        }

        public async Task<PedidoItem?> GetByIdAsync(int id)
        {
            return await _context.PedidoItems.FindAsync(id);
        }

        public async Task UpdateAsync(PedidoItem pedidoItem)
        {
            _context.PedidoItems.Update(pedidoItem);
            await _context.SaveChangesAsync();
        }
    }
}
