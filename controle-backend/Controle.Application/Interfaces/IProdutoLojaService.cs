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
        Task<ProdutoLoja> UpdateProdutoLojaAsync(int id, UpdateProdutoLojaRequest dto);
        Task<bool> DeleteProdutoLojaAsync(int id);
        Task<IEnumerable<ProdutoEstoqueDTO>> ObterEstoquePorLojaAsync(Guid lojaId);
        Task AtualizarCategoriasProdutoAsync(int produtoLojaId, List<int> categoriaIds);
        Task<ProdutoImagemDTO> AdicionarImagemAsync(int produtoLojaId, AddProdutoImagemDTO dto);
        Task RemoverImagemAsync(int produtoLojaId, int imagemId);
        Task ReordenarImagensAsync(int produtoLojaId, List<ImagemOrdemDTO> ordens);
    }
}
