using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface IPedidoService
    {
        Task<Pedido> RealizarPedidoAsync(RealizarPedidoDTO pedidoDto);
        Task<IEnumerable<Pedido>> ListarPedidosFilaAsync(Guid lojaId);
        Task<Pedido> AtualizarStatusPedidoAsync(int pedidoId, string novoStatus);
        Task<Pedido> CancelarPedidoLojistaAsync(int pedidoId, string motivo);
    }
}
