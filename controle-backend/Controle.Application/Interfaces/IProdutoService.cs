using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface IProdutoService
    {
        Task<IEnumerable<Produto>> ObterTodosAsync(Guid? lojaId = null);
        Task<Produto> ObterPorIdAsync(int id);
        Task<IEnumerable<Produto>> ObterPorTipoAsync(string tipo);
        Task<Produto> AdicionarAsync(CreateProdutoDTO dto);
        Task<Produto> AtualizarAsync(int id, UpdateProdutoDTO dto);
        Task RemoverAsync(int id);
    }
}
