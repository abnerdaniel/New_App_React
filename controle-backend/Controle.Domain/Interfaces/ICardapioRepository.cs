using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface ICardapioRepository
    {
        Task<Cardapio?> GetByIdAsync(int id);
        Task<IEnumerable<Cardapio>> GetAllAsync();
        Task<IEnumerable<Cardapio>> GetByLojaIdAsync(Guid lojaId);
        Task AddAsync(Cardapio cardapio);
        Task UpdateAsync(Cardapio cardapio);
        Task DeleteAsync(int id);
    }
}
