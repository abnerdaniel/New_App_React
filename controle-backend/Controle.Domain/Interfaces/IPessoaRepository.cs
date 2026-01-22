using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface IPessoaRepository
    {
        Task<IEnumerable<Pessoa>> GetAllAsync();
        Task<Pessoa?> GetByIdAsync(int id);
        Task<Pessoa?> GetByNomeAsync(string nome);
        Task AddAsync(Pessoa pessoa);
        Task UpdateAsync(Pessoa pessoa);
        Task DeleteAsync(int id);
    }
}