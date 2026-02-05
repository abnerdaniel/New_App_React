using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface ICardapioService
    {
        Task<Cardapio> CriarCardapioAsync(Cardapio cardapio);
        Task<Cardapio?> ObterCardapioCompletoAsync(int cardapioId);
    }
}
