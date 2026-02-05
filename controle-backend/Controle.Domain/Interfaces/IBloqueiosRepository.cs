using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface IBloqueiosRepository
    {
        Task<IEnumerable<Bloqueios>> GetAllAsync();
        Task<Bloqueios?> GetByIdAsync(int id);
        Task AddAsync(Bloqueios bloqueios);
        Task UpdateAsync(Bloqueios bloqueios);
        Task DeleteAsync(int id);
    }
}
