using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly AppDbContext _context;

        public PedidoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Pedido> RealizarPedidoAsync(RealizarPedidoDTO pedidoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var pedido = new Pedido
                {
                    LojaId = pedidoDto.LojaId,
                    ClienteId = pedidoDto.ClienteId,
                    EnderecoDeEntregaId = pedidoDto.EnderecoEntregaId,
                    DataVenda = DateTime.Now,
                    Status = "Pendente",
                    Sacola = new List<PedidoItem>(),
                    Descricao = "Pedido via App" // Default description or from DTO if available (DTO has Observacao in some versions, checking DTO structure in memory... RealizarPedidoDTO has Observacao? Let's check Step 23 view. It had Observacao commented out or removed in Step 38 update? Step 38 removed Observacao from RealizarPedidoDTO. So I'll use a default.)
                };

                decimal valorTotal = 0;
                int quantidadeTotal = 0;

                foreach (var itemDto in pedidoDto.Itens)
                {
                    // 1. Recuperar ProdutoLoja e navegar até Cardapio
                    var produtoLoja = await _context.ProdutosLojas
                        .Include(p => p.Categoria)
                        .ThenInclude(c => c.Cardapio)
                        .FirstOrDefaultAsync(p => p.Id == itemDto.IdProduto);

                    if (produtoLoja == null)
                    {
                        throw new DomainException($"Produto com ID {itemDto.IdProduto} não encontrado.");
                    }

                    // Validação de Segurança: Produto pertence à loja do pedido?
                    if (produtoLoja.LojaId != pedidoDto.LojaId)
                    {
                         throw new DomainException($"Produto {produtoLoja.Descricao} não pertence à loja informada.");
                    }

                    // 1. Validação Temporal: Verifique se este cardápio está ativo AGORA
                    var cardapio = produtoLoja.Categoria?.Cardapio;
                    if (cardapio == null || !cardapio.Ativo)
                    {
                        throw new DomainException($"O cardápio contendo o produto {produtoLoja.Descricao} não está ativo.");
                    }

                    // Validação de Horário e Dia
                    var agora = DateTime.Now;
                    var diaSemanaAtual = (int)agora.DayOfWeek;
                    var horaAtual = agora.TimeOfDay;

                    // Verifica Dia
                    if (!string.IsNullOrEmpty(cardapio.DiasSemana))
                    {
                        var dias = cardapio.DiasSemana.Split(',').Select(d => int.Parse(d.Trim())).ToList();
                        if (!dias.Contains(diaSemanaAtual))
                        {
                            throw new DomainException($"O produto {produtoLoja.Descricao} não está disponível hoje.");
                        }
                    }

                    // Verifica Horário
                    if (cardapio.HorarioInicio.HasValue && cardapio.HorarioFim.HasValue)
                    {
                        if (horaAtual < cardapio.HorarioInicio.Value || horaAtual > cardapio.HorarioFim.Value)
                        {
                            throw new DomainException($"O produto {produtoLoja.Descricao} não está disponível neste horário.");
                        }
                    }

                    // 2. Validação de Estoque
                    if (produtoLoja.QuantidadeEstoque < itemDto.Qtd)
                    {
                        throw new DomainException($"Estoque insuficiente para o produto {produtoLoja.Descricao}. Restam apenas {produtoLoja.QuantidadeEstoque}.");
                    }

                    // 3. Snapshot Financeiro (CRÍTICO)
                    var pedidoItem = new PedidoItem
                    {
                        ProdutoLojaId = produtoLoja.Id,
                        NomeProduto = produtoLoja.Descricao, // Usando Descricao como Nome
                        PrecoVenda = produtoLoja.Preco, // Preço fixo no momento da venda
                        Quantidade = itemDto.Qtd
                    };

                    pedido.Sacola.Add(pedidoItem);
                    valorTotal += (decimal)pedidoItem.PrecoVenda * pedidoItem.Quantidade; // Casting to decimal for calculation if Preco is int/decimal. Entity says int for Preco? Let's assume int based on Step 17.
                    quantidadeTotal += itemDto.Qtd;

                    // 4. Baixa de Estoque
                    produtoLoja.QuantidadeEstoque -= itemDto.Qtd;
                    produtoLoja.Vendas += itemDto.Qtd;
                    
                    // Update ProdutoLoja in context (tracked automatically, but good to be explicit mentally)
                }

                pedido.ValorTotal = (int)valorTotal; // Entity uses int for ValorTotal? Step 100 says 'public int ValorTotal'.
                pedido.Quantidade = quantidadeTotal;

                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return pedido;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<Pedido>> ListarPedidosFilaAsync(Guid lojaId)
        {
            return await _context.Pedidos
                .Where(p => p.LojaId == lojaId && (p.Status == "Pendente" || p.Status == "Em Preparo"))
                .Include(p => p.Sacola)
                .OrderBy(p => p.DataVenda)
                .ToListAsync();
        }

        public async Task<Pedido> AtualizarStatusPedidoAsync(int pedidoId, string novoStatus)
        {
            var pedido = await _context.Pedidos.FindAsync(pedidoId);
            if (pedido == null) throw new DomainException("Pedido não encontrado.");

            pedido.Status = novoStatus;
            _context.Pedidos.Update(pedido);
            await _context.SaveChangesAsync();

            return pedido;
        }

        public async Task<Pedido> CancelarPedidoLojistaAsync(int pedidoId, string motivo)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pedido = await _context.Pedidos
                    .Include(p => p.Sacola)
                    .FirstOrDefaultAsync(p => p.Id == pedidoId);

                if (pedido == null) throw new DomainException("Pedido não encontrado.");

                if (pedido.Status == "Cancelado") throw new DomainException("Pedido já está cancelado.");

                pedido.Status = "Cancelado";
                pedido.Descricao += $" (Cancelado: {motivo})"; // Append reason to description or handle as needed

                // Estorno de Estoque
                foreach (var item in pedido.Sacola)
                {
                    var produtoLoja = await _context.ProdutosLojas.FindAsync(item.ProdutoLojaId);
                    if (produtoLoja != null)
                    {
                        produtoLoja.QuantidadeEstoque += item.Quantidade;
                        produtoLoja.Vendas -= item.Quantidade; // Optional: revert sales count
                        _context.ProdutosLojas.Update(produtoLoja);
                    }
                }

                _context.Pedidos.Update(pedido);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return pedido;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
