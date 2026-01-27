using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface ILojaService
    {
        Task<Loja> AtualizarConfiguracoesAsync(int lojaId, LojaConfiguracaoDTO dto);
        Task<Loja> GerirTaxasEntregaAsync(int lojaId, TaxaEntregaDTO dto);
        Task<Loja> AbrirFecharLojaAsync(int lojaId, bool? aberta);
    }
}
