using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;

namespace Controle.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IPedidoRepository _pedidoRepository;
        private readonly IPedidoItemRepository _pedidoItemRepository;

        public DashboardService(IPedidoRepository pedidoRepository, IPedidoItemRepository pedidoItemRepository)
        {
            _pedidoRepository = pedidoRepository;
            _pedidoItemRepository = pedidoItemRepository;
        }

        public async Task<DashboardResumoDTO> GetResumoDoDiaAsync(int lojaId)
        {
            var pedidos = await _pedidoRepository.GetAllAsync();
            
            // Filtra pedidos da loja e da data de hoje
            var hoje = DateTime.UtcNow.Date;
            var pedidosHoje = pedidos.Where(p => p.LojaId == lojaId && p.DataVenda.Date == hoje).ToList();

            var totalVendido = pedidosHoje.Where(p => p.Status != "Cancelado").Sum(p => p.ValorTotal);
            var pedidosCancelados = pedidosHoje.Count(p => p.Status == "Cancelado");
            var totalPedidos = pedidosHoje.Count;
            var ticketMedio = totalPedidos > 0 ? totalVendido / totalPedidos : 0;

            return new DashboardResumoDTO
            {
                TotalVendidoHoje = totalVendido,
                TicketMedio = ticketMedio,
                PedidosCancelados = pedidosCancelados,
                TotalPedidosHoje = totalPedidos
            };
        }

        public async Task<IEnumerable<ProdutoRankingDTO>> GetProdutosMaisVendidosAsync(int lojaId)
        {
            var pedidos = await _pedidoRepository.GetAllAsync();
            var pedidosLoja = pedidos.Where(p => p.LojaId == lojaId && p.Status != "Cancelado").ToList();
            
            var pedidoIds = pedidosLoja.Select(p => p.Id).ToList();

            var itens = await _pedidoItemRepository.GetAllAsync();
            var itensLoja = itens.Where(i => pedidoIds.Contains(i.PedidoId)).ToList();

            var ranking = itensLoja
                .GroupBy(i => i.NomeProduto)
                .Select(g => new ProdutoRankingDTO
                {
                    NomeProduto = g.Key,
                    QuantidadeVendida = g.Sum(i => i.Quantidade),
                    ValorTotalVendido = g.Sum(i => i.PrecoVenda * i.Quantidade)
                })
                .OrderByDescending(r => r.QuantidadeVendida)
                .Take(10) // Top 10
                .ToList();

            return ranking;
        }
    }
}
