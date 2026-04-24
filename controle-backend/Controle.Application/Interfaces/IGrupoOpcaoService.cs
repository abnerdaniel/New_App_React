using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;

namespace Controle.Application.Interfaces
{
    public interface IGrupoOpcaoService
    {
        Task<List<GrupoOpcaoDTO>> ListarPorProdutoAsync(int produtoLojaId);
        Task<GrupoOpcaoDTO> CriarGrupoAsync(int produtoLojaId, CreateGrupoOpcaoRequest request);
        Task<GrupoOpcaoDTO> AtualizarGrupoAsync(int grupoId, UpdateGrupoOpcaoRequest request);
        Task DeletarGrupoAsync(int grupoId);

        Task<OpcaoItemDTO> AdicionarItemAsync(int grupoId, CreateOpcaoItemRequest request);
        Task<OpcaoItemDTO> AtualizarItemAsync(int itemId, UpdateOpcaoItemRequest request);
        Task DeletarItemAsync(int itemId);
    }
}
