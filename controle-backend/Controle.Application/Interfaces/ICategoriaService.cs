using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface ICategoriaService
    {
        Task<CategoriaSimplesDTO> CriarCategoriaAsync(CreateCategoriaDTO dto);
        Task<CategoriaSimplesDTO> AtualizarCategoriaAsync(int id, UpdateCategoriaDTO dto);
        Task ExcluirCategoriaAsync(int id);
        Task<IEnumerable<CategoriaSimplesDTO>> ListarPorCardapioAsync(int cardapioId);
        Task<CategoriaSimplesDTO?> ObterPorIdAsync(int id);
        Task ReordenarCategoriasAsync(List<KeyValuePair<int, int>> ordem);
    }
}
