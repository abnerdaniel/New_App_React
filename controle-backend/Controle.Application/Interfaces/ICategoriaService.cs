
using Controle.Domain.Entities;
using Controle.Application.Services;

namespace Controle.Application.Interfaces
{
    public interface ICategoriaService
    {
        Task<Result> CriarCategoriaAsync(Categoria categoria);
        Task<Categoria> ObterCategoriaPorIdAsync(int id);   
        Task<IEnumerable<Categoria>> ObterTodasCategoriasAsync();
        Task<Result> AtualizarCategoriaAsync(Categoria categoria);   
        Task<Result> DeletarCategoriaAsync(int id);
    }
}