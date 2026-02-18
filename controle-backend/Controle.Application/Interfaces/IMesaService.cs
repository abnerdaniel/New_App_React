using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Application.Interfaces;

public interface IMesaService
{
    Task<IEnumerable<Mesa>> ListarMesasAsync(Guid lojaId);
    Task<Mesa?> GetMesaByIdAsync(int id);
    Task ConfigurarMesasAsync(Guid lojaId, int quantidade);
    Task AtualizarApelidoAsync(int id, string apelido);
    Task<Mesa> AbrirMesaAsync(int mesaId, string? nomeCliente, int? funcionarioId);
    Task LiberarMesaAsync(int mesaId);
    Task<Mesa> AtualizarStatusAsync(int mesaId, string status);
    Task RemoverItemPedidoAsync(int pedidoItemId);
    Task AplicarDescontoAsync(int pedidoId, int desconto);
    Task<IEnumerable<Controle.Application.DTOs.ProdutoLojaDto>> ListarProdutosLojaAsync(Guid lojaId);
    Task AdicionarItemPedidoAsync(int pedidoId, int? produtoLojaId, int? comboId, int quantidade);
    Task<Pedido> AtualizarStatusItemPedidoAsync(int pedidoItemId, string status);
    Task RecalcularStatusMesaAsync(int mesaId);
}
