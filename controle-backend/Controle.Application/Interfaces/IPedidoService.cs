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
        Task<Pedido?> GetPedidoByIdAsync(int id);
        Task<IEnumerable<Pedido>> GetPedidosByClienteIdAsync(int clienteId);
        Task<Pedido> CancelarPedidoLojistaAsync(int pedidoId, string motivo);
        Task<Pedido> CancelarPedidoClienteAsync(int pedidoId, string motivo, int clienteId);
        Task<Pedido> AtualizarObservacaoAsync(int pedidoId, string novaObservacao);
    }
}
