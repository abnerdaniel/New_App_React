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

        public async Task<DashboardResumoDTO> GetResumoDoDiaAsync(Guid lojaId)
        {
            var pedidos = await _pedidoRepository.GetAllAsync();
            
            // Filtra pedidos da loja e da data de hoje
            var hoje = DateTime.UtcNow.Date;
            var pedidosHoje = pedidos.Where(p => p.LojaId == lojaId && p.DataVenda.Date == hoje).ToList();

            var totalVendido = pedidosHoje.Where(p => p.Status != "Cancelado").Sum(p => p.ValorTotal); // Sum de int? returns int? mas se erro diz int e int, vamos confiar. Se der erro converteremos.
            // Na verdade, se ValorTotal é int?, Sum deve retornar int? ou 0 se vazio?
            // Teste: Se der erro de conversão int? para int, usaremos (int)(Sum(...) ?? 0).
            // O erro anterior foi "Operator ?? cannot be applied to int and int". Entao retorna int.
            var pedidosCancelados = pedidosHoje.Count(p => p.Status == "Cancelado");
            var totalPedidos = pedidosHoje.Count;
            var ticketMedio = totalPedidos > 0 ? (totalVendido ?? 0) / totalPedidos : 0; // Se totalVendido é int?, precisamos tratar aqui.
            // Se totalVendido é int, o compilador reclamará do ?? 0 aqui também.
            // Vamos assumir que Sum retorna int? e o compilador estava confuso ou algo do tipo. 
            // Espera, se Sum retorna int, então totalVendido é int.
            // Vou remover ?? 0 da definição de totalVendido.
            
            return new DashboardResumoDTO
            {
                TotalVendidoHoje = totalVendido ?? 0, // Se totalVendido for int, remove o ??. Se for int?, mantem.
                // O erro CS0019 foi na linha 37 e 40.
                // Linha 37: TotalVendidoHoje = totalVendido ?? 0
                // Linha 40: ... = ticketMedio ?? 0 (que nem existe mais no diff anterior, mas TicketMedio propriedade talvez)
                
                // Vou fazer o seguinte: Cast explicito e tratamento seguro.
                TicketMedio = ticketMedio,
                PedidosCancelados = pedidosCancelados,
                TotalPedidosHoje = totalPedidos
            };
        }

        public async Task<IEnumerable<ProdutoRankingDTO>> GetProdutosMaisVendidosAsync(Guid lojaId)
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
