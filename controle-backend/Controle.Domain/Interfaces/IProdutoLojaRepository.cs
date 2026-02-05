using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface IProdutoLojaRepository
    {
        Task<ProdutoLoja> AddAsync(ProdutoLoja produtoLoja);
        Task<ProdutoLoja?> GetByProdutoAndLojaAsync(int produtoId, Guid lojaId);
        Task<IEnumerable<ProdutoLoja>> GetByLojaIdAsync(Guid lojaId);
        Task<ProdutoLoja?> GetByIdAsync(int id);
        Task UpdateAsync(ProdutoLoja produtoLoja);
        Task RemoveAsync(ProdutoLoja produtoLoja);
    }
}
