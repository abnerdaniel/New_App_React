using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces
{
    public interface IPedidoService
    {
        Task<Pedido> RealizarPedidoAsync(RealizarPedidoDTO pedidoDto);
    }
}
