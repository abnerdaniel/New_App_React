using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface ILojaService
    {
        Task<Loja> AtualizarConfiguracoesAsync(Guid lojaId, LojaConfiguracaoDTO dto);
        Task<Loja> GerirTaxasEntregaAsync(Guid lojaId, TaxaEntregaDTO dto);
        Task<Loja> AbrirFecharLojaAsync(Guid lojaId, bool? aberta);
        Task<Loja> CriarLojaAsync(CreateLojaDTO dto);
        Task<Loja> AtualizarLojaAsync(Guid lojaId, UpdateLojaDTO dto);
        Task<IEnumerable<Loja>> GetLojasByUsuarioIdAsync(Guid usuarioId);
    }
}
