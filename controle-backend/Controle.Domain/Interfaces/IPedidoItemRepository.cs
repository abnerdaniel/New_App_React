using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface IPedidoItemRepository
    {
        Task<IEnumerable<PedidoItem>> GetAllAsync();
        Task<PedidoItem?> GetByIdAsync(int id);
        Task AddAsync(PedidoItem pedidoItem);
        Task UpdateAsync(PedidoItem pedidoItem);
        Task DeleteAsync(int id);
    }
}
