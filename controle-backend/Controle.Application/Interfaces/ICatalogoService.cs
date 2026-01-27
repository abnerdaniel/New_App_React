using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface ICatalogoService
    {
        Task<ProdutoLoja> AdicionarProdutoNaLojaAsync(int lojaId, int produtoGlobalId, int categoriaId, decimal preco, int estoque);
    }
}
