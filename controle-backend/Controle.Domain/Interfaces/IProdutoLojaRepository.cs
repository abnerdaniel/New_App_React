using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface IProdutoLojaRepository
    {
        Task<IEnumerable<ProdutoLoja>> GetAllAsync();
        Task<ProdutoLoja?> GetByIdAsync(int id);
        Task AddAsync(ProdutoLoja produtoLoja);
        Task UpdateAsync(ProdutoLoja produtoLoja);
        Task DeleteAsync(int id);
    }
}
