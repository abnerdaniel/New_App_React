using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface IProdutoLojaService
    {
        Task<ProdutoLoja> AdicionarProdutoLojaAsync(CreateProdutoLojaRequest dto);
        Task<IEnumerable<ProdutoEstoqueDTO>> ObterEstoquePorLojaAsync(Guid lojaId);
    }
}
