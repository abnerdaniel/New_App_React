using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface ICargoRepository
    {
        Task<IEnumerable<Cargo>> GetAllAsync();
        Task<Cargo> GetByIdAsync(int id);
        Task<Cargo> GetByNameAsync(string nome);
        Task AddAsync(Cargo cargo);
    }
}
