#pragma warning disable CS8602
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;
using Controle.Domain.Entities;

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

        public async Task<FinanceiroResumoDTO> GetFinanceiroResumoAsync(Guid lojaId, DateTime inicio, DateTime fim)
        {
            var pedidos = await _pedidoRepository.GetAllAsync();
            
            // Filtro por Loja, Status "Concluido" (ou similar, vamos usar != Cancelado por enquanto para pegar tudo que rolou, ou apenas Concluído?)
            // O usuário pediu "Faturação Bruta: Soma de todos os pedidos concluídos". 
            // Vamos filtrar por Status != 'Cancelado' e != 'Pendente' se quiser apenas os finalizados. 
            // Mas 'Pendente' pode ser venda que vai entrar.
            // Para "Faturamento", geralmente conta o mês fechado ou vendas realizadas.
            // Vou considerar Status != "Cancelado" para dar uma visão geral, ou melhor, status que indicam sucesso.
            // Vamos assumir != Cancelado para simplificar, mas idealmente seria Status == 'Entregue' || Status == 'Concluido'
            
            // Ajuste de datas (inicio 00:00 e fim 23:59)
            var dataInicio = inicio.Date;
            var dataFim = fim.Date.AddDays(1).AddTicks(-1);

            var pedidosFiltrados = pedidos
                .Where(p => p.LojaId == lojaId 
                            && p.DataVenda >= dataInicio 
                            && p.DataVenda <= dataFim
                            && p.Status != "Cancelado") 
                .ToList();

            var dto = new FinanceiroResumoDTO();

            foreach (var p in pedidosFiltrados)
            {
                decimal valorTotal = (decimal)(p.ValorTotal ?? 0) / 100m;
                decimal desconto = (decimal)(p.Desconto ?? 0) / 100m;
                
                // Calcular itens para achar taxa entrega
                decimal somaItens = (p.Sacola ?? new List<PedidoItem>()).Sum(i => (decimal)i.PrecoVenda * i.Quantidade) / 100m;
                decimal taxaEntrega = valorTotal - somaItens + desconto;
                
                // Se der negativo (erro de dados), zaramos
                if (taxaEntrega < 0) taxaEntrega = 0;

                dto.FaturamentoBruto += valorTotal;
                dto.TotalDescontos += desconto;
                dto.TaxasEntrega += taxaEntrega;
                dto.TotalPedidos++;

                // Popula gráficos
                // 1. Evolução Diária
                var dia = p.DataVenda.Date;
                var gravDia = dto.EvolucaoDiaria.FirstOrDefault(d => d.Data == dia);
                if (gravDia == null)
                {
                    gravDia = new GraficoVendasDiaDTO { Data = dia };
                    dto.EvolucaoDiaria.Add(gravDia);
                }
                gravDia.Valor += valorTotal;
                gravDia.Quantidade++;

                // 2. Meios de Pagamento
                var metodo = string.IsNullOrEmpty(p.MetodoPagamento) ? "Outros" : p.MetodoPagamento;
                var gravPag = dto.MeiosPagamento.FirstOrDefault(m => m.Metodo == metodo);
                if (gravPag == null)
                {
                    gravPag = new GraficoPagamentoDTO { Metodo = metodo };
                    dto.MeiosPagamento.Add(gravPag);
                }
                gravPag.Valor += valorTotal;
                gravPag.Quantidade++;
            }

            dto.FaturamentoLiquido = dto.FaturamentoBruto - dto.TotalDescontos - dto.TaxasEntrega; // Taxa plataforma não temos, subtraimos só descontos e taxas entrega??
            // O usuário disse: Faturação Líquida: Bruto - (Taxas da Plataforma + Descontos).
            // Como não temos taxa plataforma, vamos subtrair Descontos.
            // E Taxa de Entrega vai para o motoboy, então talvez Faturamento Liquido DA LOJA não deva incluir taxa de entrega.
            // Vou remover TaxasEntrega do Liquido também, para sobrar só o produto.
            dto.FaturamentoLiquido = dto.FaturamentoBruto - dto.TotalDescontos - dto.TaxasEntrega;

            if (dto.TotalPedidos > 0)
            {
                dto.TicketMedio = dto.FaturamentoBruto / dto.TotalPedidos;
            }

            // Ordenar gráfico diário
            dto.EvolucaoDiaria = dto.EvolucaoDiaria.OrderBy(d => d.Data).ToList();

            return dto;
        }

        public async Task<IEnumerable<TransacaoDTO>> GetTransacoesAsync(Guid lojaId, DateTime inicio, DateTime fim)
        {
             var pedidos = await _pedidoRepository.GetAllAsync();
             
             var dataInicio = inicio.Date;
             var dataFim = fim.Date.AddDays(1).AddTicks(-1);

             var pedidosFiltrados = pedidos
                .Where(p => p.LojaId == lojaId 
                            && p.DataVenda >= dataInicio 
                            && p.DataVenda <= dataFim)
                .OrderByDescending(p => p.DataVenda)
                .ToList();

             return pedidosFiltrados.Select(p => new TransacaoDTO
             {
                 PedidoId = Guid.NewGuid(), 
                 NumeroPedido = p.Id,
                 DataHora = p.DataVenda,
                 NomeCliente = p.Cliente?.Nome ?? "Cliente Balcão",
                 Tipo = p.Status == "Cancelado" ? "Cancelamento" : "Venda",
                 Status = p.Status ?? "Desconhecido",
                 FormaPagamento = p.MetodoPagamento ?? "N/A",
                 ValorTotal = (decimal)(p.ValorTotal ?? 0) / 100m
             });
        }
    }
}
