using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface ILojaRepository
    {
        Task<IEnumerable<Loja>> GetAllAsync();
        Task<Loja?> GetByIdAsync(Guid id);
        Task<IEnumerable<Loja>> GetByUsuarioIdAsync(Guid usuarioId);
        Task<Loja?> GetByTelefoneAsync(string telefone);
        Task AddAsync(Loja loja);
        Task UpdateAsync(Loja loja);
        Task DeleteAsync(Guid id);
    }
}
