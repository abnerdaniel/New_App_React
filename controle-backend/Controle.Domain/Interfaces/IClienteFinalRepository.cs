using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface IClienteFinalRepository
    {
        Task<IEnumerable<ClienteFinal>> GetAllAsync();
        Task<ClienteFinal?> GetByIdAsync(int id);
        Task AddAsync(ClienteFinal clienteFinal);
        Task UpdateAsync(ClienteFinal clienteFinal);
        Task DeleteAsync(int id);
    }
}
