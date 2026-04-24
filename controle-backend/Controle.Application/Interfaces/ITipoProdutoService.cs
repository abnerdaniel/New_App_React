using Controle.Application.DTOs;

namespace Controle.Application.Interfaces;

public interface ITipoProdutoService
{
    Task<IEnumerable<TipoProdutoDTO>> ListarPorLojaAsync(Guid lojaId);
    Task<TipoProdutoDTO> CriarAsync(Guid lojaId, CreateTipoProdutoDTO dto);
    Task<TipoProdutoDTO> AtualizarAsync(int id, Guid lojaId, UpdateTipoProdutoDTO dto);
    Task ExcluirAsync(int id, Guid lojaId);
}
