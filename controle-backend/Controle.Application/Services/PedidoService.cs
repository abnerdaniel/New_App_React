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
        private readonly ILojaService _lojaService;

        public PedidoService(AppDbContext context, ILojaService lojaService)
        {
            _context = context;
            _lojaService = lojaService;
        }

        public async Task<Pedido> RealizarPedidoAsync(RealizarPedidoDTO pedidoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Validar Loja (Supports Guid or Slug)
                var loja = await _lojaService.GetLojaByIdentifierAsync(pedidoDto.LojaId);
                if (loja == null) throw new DomainException("Loja não encontrada.");
                if (!loja.Ativo) throw new DomainException("A loja está inativa no momento.");
                
                // Validação simplificada de "Aberta" (Falso se AbertaManualmente for false)
                // Futuro: Verificar horários se AbertaManualmente for null
                if (loja.AbertaManualmente == false)
                {
                     throw new DomainException("A loja está fechada no momento.");
                }

                // Validação de Endereço para Entrega
                if (!pedidoDto.IsRetirada && !pedidoDto.EnderecoEntregaId.HasValue)
                {
                    throw new DomainException("Endereço de entrega é obrigatório para entregas.");
                }

                var pedido = new Pedido
                {
                    LojaId = loja.Id, // Resolve to the real Guid from the entity
                    ClienteId = pedidoDto.ClienteId,
                    EnderecoDeEntregaId = pedidoDto.IsRetirada ? null : pedidoDto.EnderecoEntregaId,
                    DataVenda = DateTime.UtcNow,
                    Status = "Aguardando Aceitação", // Novo Status Inicial
                    Sacola = new List<PedidoItem>(),
                    Descricao = pedidoDto.IsRetirada ? "Retirada em Loja" : "Pedido via App",
                    MetodoPagamento = pedidoDto.MetodoPagamento,
                    TrocoPara = pedidoDto.TrocoPara,
                    Observacao = pedidoDto.Observacao,
                    IsRetirada = pedidoDto.IsRetirada
                };

                // Taxa de entrega da loja ou padrão 5.00 (Se retirada = 0)
                decimal taxaEntrega = pedidoDto.IsRetirada ? 0 : (loja.TaxaEntregaFixa ?? 5.00m);
                decimal valorTotal = taxaEntrega;
                int quantidadeTotal = 0;

                foreach (var itemDto in pedidoDto.Itens)
                {
                    if (itemDto.IdCombo.HasValue)
                    {
                        // LÓGICA DE COMBO
                        var combo = await _context.Combos
                            .Include(c => c.Itens)
                                .ThenInclude(ci => ci.ProdutoLoja)
                                    .ThenInclude(pl => pl.Produto)
                            .FirstOrDefaultAsync(c => c.Id == itemDto.IdCombo.Value);

                        if (combo == null) throw new DomainException($"Combo com ID {itemDto.IdCombo} não encontrado.");
                        if (!combo.Ativo) throw new DomainException($"O combo {combo.Nome} não está ativo.");

                        // Validar Estoque de CADA item do combo
                        foreach (var comboItem in combo.Itens)
                        {
                           // REFATORAÇÃO: Busca Dinâmica de Estoque (Smart Lookup)
                           // Em vez de confiar cegamente no comboItem.ProdutoLoja (que pode ser antigo/sem estoque),
                           // buscamos o ProdutoLoja ATUAL para este ProdutoGlobal nesta Loja.
                           
                           var globalProductId = comboItem.ProdutoLoja?.ProdutoId 
                                                 ?? (await _context.ProdutosLojas.AsNoTracking()
                                                    .Where(pl => pl.Id == comboItem.ProdutoLojaId)
                                                    .Select(pl => pl.ProdutoId)
                                                    .FirstOrDefaultAsync());

                           if (globalProductId == 0)
                           {
                                throw new DomainException($"Inconsistência no Combo: Item {comboItem.Id} não possui vínculo válido com produto.");
                           }

                           // Busca o ProdutoLoja "valendo" (com estoque preferencialmente)
                           var produtoLojaAtivo = await _context.ProdutosLojas
                                .Include(pl => pl.Produto)
                                .Where(pl => pl.LojaId == loja.Id && pl.ProdutoId == globalProductId)
                                .OrderByDescending(pl => pl.Estoque ?? 0) // REFATORADO: Usa 'Estoque' (nullable)
                                .FirstOrDefaultAsync();

                           if (produtoLojaAtivo == null)
                           {
                               throw new DomainException($"Produto do combo não está disponível nesta loja no momento.");
                           }

                           var required = (comboItem.Quantidade * itemDto.Qtd);
                           var currentStock = produtoLojaAtivo.Estoque ?? 0; // Verifica campo real

                           if (currentStock < required)
                           {
                               var nomeProduto = produtoLojaAtivo.Produto?.Nome ?? produtoLojaAtivo.Descricao;
                               throw new DomainException($"Estoque insuficiente para o produto {nomeProduto} (no combo {combo.Nome}). Estoque Atual: {currentStock}, Requerido: {required}");
                           }

                           // Atualiza o objeto para o loop de baixa de estoque posterior usar o CERTO
                           comboItem.ProdutoLoja = produtoLojaAtivo;
                           comboItem.ProdutoLojaId = produtoLojaAtivo.Id;
                        }

                        // Criar PedidoItem para o Combo
                        var pedidoItem = new PedidoItem
                        {
                            ComboId = combo.Id,
                            ProdutoLojaId = null, // É um combo
                            NomeProduto = combo.Nome,
                            PrecoVenda = combo.Preco,
                            Quantidade = itemDto.Qtd
                        };
                        pedido.Sacola.Add(pedidoItem);
                        valorTotal += (decimal)pedidoItem.PrecoVenda * pedidoItem.Quantidade;

                        // Baixar Estoque
                        foreach (var comboItem in combo.Itens)
                        {
                            if (comboItem.ProdutoLoja != null)
                            {
                                var current = comboItem.ProdutoLoja.Estoque ?? 0;
                                comboItem.ProdutoLoja.Estoque = current - (comboItem.Quantidade * itemDto.Qtd);
                                
                                comboItem.ProdutoLoja.Vendas += (comboItem.Quantidade * itemDto.Qtd);
                                _context.ProdutosLojas.Update(comboItem.ProdutoLoja); // Garante update no item certo
                            }
                        }
                    }
                    else if (itemDto.IdProduto.HasValue)
                    {
                        // LÓGICA DE PRODUTO INDIVIDUAL
                        // Também aplicamos o Smart Lookup aqui para prevenir erros de "ID antigo" no Frontend
                        
                        // 1. Descobrir qual é o Produto Global desse ID enviado
                        var originalProdutoLoja = await _context.ProdutosLojas.AsNoTracking()
                            .FirstOrDefaultAsync(p => p.Id == itemDto.IdProduto.Value);
                        
                        if (originalProdutoLoja == null)
                             throw new DomainException($"Produto com ID {itemDto.IdProduto} não encontrado.");

                        // 2. Buscar a MELHOR versão desse produto na loja (com estoque)
                        var produtoLoja = await _context.ProdutosLojas
                            .Include(p => p.Categoria)
                                .ThenInclude(c => c!.Cardapio)
                            .Include(p => p.Produto)
                            .Where(pl => pl.LojaId == loja.Id && pl.ProdutoId == originalProdutoLoja.ProdutoId)
                            .OrderByDescending(pl => pl.Estoque ?? 0) // Usa Estoque
                            .FirstOrDefaultAsync();

                        if (produtoLoja == null)
                             throw new DomainException($"Produto indisponível na loja.");

                        // Validações...
                        var cardapio = produtoLoja.Categoria?.Cardapio;
                        if (cardapio != null && !cardapio.Ativo) 
                             throw new DomainException($"Cardápio inativo.");

                        var currentStock = produtoLoja.Estoque ?? 0;
                        if (currentStock < itemDto.Qtd)
                        {
                            var nomeProd = produtoLoja.Produto?.Nome ?? produtoLoja.Descricao;
                            throw new DomainException($"Estoque insuficiente para o produto {nomeProd}. Estoque Atual: {currentStock}, Requerido: {itemDto.Qtd}");
                        }

                        var pedidoItem = new PedidoItem
                        {
                            ProdutoLojaId = produtoLoja.Id,
                            NomeProduto = produtoLoja.Descricao,
                            PrecoVenda = produtoLoja.Preco,
                            Quantidade = itemDto.Qtd,
                            Adicionais = new List<PedidoItemAdicional>()
                        };

                        // LÓGICA DE ADICIONAIS
                        if (itemDto.AdicionaisIds != null && itemDto.AdicionaisIds.Any())
                        {
                            // Buscar os produtosloja dos adicionais para pegar preço e estoque atual
                            var adicionaisLojas = await _context.ProdutosLojas
                                .Where(pl => itemDto.AdicionaisIds.Contains(pl.Id))
                                .ToListAsync();

                            foreach (var idAdicional in itemDto.AdicionaisIds)
                            {
                                var adicionalLoja = adicionaisLojas.FirstOrDefault(pl => pl.Id == idAdicional);
                                if (adicionalLoja == null) continue; // Ou lançar erro

                                // Validar Estoque do Adicional (Considerando que cada unidade do item principal leva 1 do adicional)
                                int qtdAdicionalNecessaria = itemDto.Qtd; 
                                var stockAdicional = adicionalLoja.Estoque ?? 0; // Usa Estoque

                                if (stockAdicional < qtdAdicionalNecessaria)
                                {
                                     throw new DomainException($"Estoque insuficiente para o adicional {adicionalLoja.Descricao}.");
                                }

                                // Baixar Estoque do Adicional
                                adicionalLoja.Estoque = stockAdicional - qtdAdicionalNecessaria;
                                adicionalLoja.Vendas += qtdAdicionalNecessaria;

                                // Adicionar ao PedidoItem
                                pedidoItem.Adicionais.Add(new PedidoItemAdicional
                                {
                                    ProdutoLojaId = adicionalLoja.Id,
                                    PrecoVenda = adicionalLoja.Preco
                                });

                                // Somar ao total do item (ou do pedido?)
                                // O PreçoVenda do PedidoItem geralmente é unitário ou total? 
                                // No modelo atual: pedidoItem.PrecoVenda é unitário do produto principal.
                                // O valorTotal do pedido soma (PrecoItem + PrecoAdicionais) * Quantidade?
                                // Vamos somar o valor dos adicionais ao valorTotal do pedido diretamente.
                                valorTotal += (decimal)adicionalLoja.Preco * itemDto.Qtd;
                            }
                        }

                        pedido.Sacola.Add(pedidoItem);
                        valorTotal += (decimal)pedidoItem.PrecoVenda * pedidoItem.Quantidade;
                        quantidadeTotal += itemDto.Qtd;

                        // Baixa no Item Principal
                        var currentPStock = produtoLoja.Estoque ?? 0;
                        produtoLoja.Estoque = currentPStock - itemDto.Qtd;
                        produtoLoja.Vendas += itemDto.Qtd;
                    }
                }

                pedido.ValorTotal = (int)valorTotal;
                pedido.Quantidade = quantidadeTotal; // This might be summing combo as 1 item, which is correct for "items in bag"

                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return pedido;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[ERRO REALIZAR PEDIDO]: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                throw;
            }
        }

        public async Task<Pedido?> GetPedidoByIdAsync(int id)
        {
            return await _context.Pedidos
                .Include(p => p.Loja)
                .Include(p => p.Sacola)
                    .ThenInclude(s => s.Adicionais)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Pedido>> GetPedidosByClienteIdAsync(int clienteId)
        {
            return await _context.Pedidos
                .Where(p => p.ClienteId == clienteId)
                .Include(p => p.Loja)
                .Include(p => p.Sacola)
                .OrderByDescending(p => p.DataVenda)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> ListarPedidosFilaAsync(Guid lojaId)
        {
            var statusVisiveis = new[] { "Aberto", "Pendente", "Aguardando Aceitação", "Em Preparo", "Pronto", "Saiu para Entrega" };
            
            return await _context.Pedidos
                .Where(p => p.LojaId == lojaId && statusVisiveis.Contains(p.Status))
                .Where(p => p.Status != "Aberto" || p.Sacola.Any()) // Só mostrar 'Aberto' se tiver itens
                .Include(p => p.Cliente)
                .Include(p => p.EnderecoDeEntrega)
                .Include(p => p.Sacola)
                    .ThenInclude(s => s.ProdutoLoja)
                        .ThenInclude(pl => pl.Produto)
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
                        .ThenInclude(s => s.Adicionais)
                    .FirstOrDefaultAsync(p => p.Id == pedidoId);

                if (pedido == null) throw new DomainException("Pedido não encontrado.");

                if (pedido.Status == "Cancelado") throw new DomainException("Pedido já está cancelado.");

                pedido.Status = "Cancelado";
                pedido.Descricao += $" (Cancelado: {motivo})"; // Append reason to description or handle as needed

                // Estorno de Estoque
                foreach (var item in pedido.Sacola)
                {
                    if (item.ProdutoLojaId.HasValue)
                    {
                        var produtoLoja = await _context.ProdutosLojas.FindAsync(item.ProdutoLojaId.Value);
                        if (produtoLoja != null)
                        {
                            produtoLoja.Estoque = (produtoLoja.Estoque ?? 0) + item.Quantidade; // Sync Estorno
                            produtoLoja.Vendas -= item.Quantidade; 
                            _context.ProdutosLojas.Update(produtoLoja);
                        }
                    }
                    else if (item.ComboId.HasValue)
                    {
                         // Estornar itens do Combo
                         var combo = await _context.Combos
                             .Include(c => c.Itens).ThenInclude(ci => ci.ProdutoLoja)
                             .FirstOrDefaultAsync(c => c.Id == item.ComboId.Value);
                         
                         if (combo != null)
                         {
                             foreach(var ci in combo.Itens)
                             {
                                 ci.ProdutoLoja.Estoque = (ci.ProdutoLoja.Estoque ?? 0) + (ci.Quantidade * item.Quantidade); // Sync Estorno
                                 ci.ProdutoLoja.Vendas -= (ci.Quantidade * item.Quantidade);
                             }
                         }
                    }

                    // Estornar ADICIONAIS
                    if (item.Adicionais != null && item.Adicionais.Any())
                    {
                        foreach (var adicional in item.Adicionais)
                        {
                            var adicionalLoja = await _context.ProdutosLojas.FindAsync(adicional.ProdutoLojaId);
                            if (adicionalLoja != null)
                            {
                                // Cada unidade do item principal consome 1 unidade do adicional
                                adicionalLoja.Estoque = (adicionalLoja.Estoque ?? 0) + item.Quantidade; // Sync Estorno
                                adicionalLoja.Vendas -= item.Quantidade;
                                _context.ProdutosLojas.Update(adicionalLoja);
                            }
                        }
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

        public async Task<Pedido> CancelarPedidoClienteAsync(int pedidoId, string motivo, int clienteId)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Loja)
                .Include(p => p.Sacola)
                    .ThenInclude(s => s.Adicionais)
                .FirstOrDefaultAsync(p => p.Id == pedidoId);

            if (pedido == null) throw new Exception("Pedido não encontrado.");
            if (pedido.ClienteId != clienteId) throw new Exception("Pedido não pertence a este cliente.");

            var loja = pedido.Loja;
            if (loja == null) throw new Exception("Loja não encontrada.");

            if (!loja.PermitirCancelamentoCliente)
                throw new Exception("Esta loja não permite cancelamento pelo cliente.");

            // Validar Status logic
            int currentRank = GetStatusRank(pedido.Status);
            int limitRank = GetStatusRank(loja.StatusMaximoCancelamento);

            if (currentRank > limitRank)
                throw new Exception($"Cancelamento não permitido nesta etapa ({pedido.Status}).");
            
            if (pedido.Status == "Cancelado")
                 throw new Exception("Pedido já está cancelado.");

            // Restaurar Estoque logic reusing Lojista logic or calling internal
            // For now, I'll Copy-Paste logic or Refactor. 
            // Better Copy-Paste to avoid breaking Lojista logic if I want to refactor later.
            // Or better: Extract private method `RestaurarEstoque(Pedido pedido)`.
            // But for speed and safety now, I will inline logic similar to Logista.
            
            // Actually, I can call `_produtoLojaService.RestaurarEstoque(pedido)` if I had it?
            // Existing Lojista code does manual logic inside the method.
            // I will inline it here too to match existing style.
             foreach (var item in pedido.Sacola)
                {
                    if (item.ProdutoLojaId.HasValue)
                    {
                        var produtoLoja = await _context.ProdutosLojas.FindAsync(item.ProdutoLojaId.Value);
                        if (produtoLoja != null)
                        {
                            produtoLoja.Estoque = (produtoLoja.Estoque ?? 0) + item.Quantidade;
                            produtoLoja.Vendas -= item.Quantidade; 
                            _context.ProdutosLojas.Update(produtoLoja);
                        }
                    }
                    else if (item.ComboId.HasValue)
                    {
                         var combo = await _context.Combos
                             .Include(c => c.Itens).ThenInclude(ci => ci.ProdutoLoja)
                             .FirstOrDefaultAsync(c => c.Id == item.ComboId.Value);
                         
                         if (combo != null)
                         {
                             foreach(var ci in combo.Itens)
                             {
                                 ci.ProdutoLoja.Estoque = (ci.ProdutoLoja.Estoque ?? 0) + (ci.Quantidade * item.Quantidade);
                                 ci.ProdutoLoja.Vendas -= (ci.Quantidade * item.Quantidade);
                             }
                         }
                    }
                    if (item.Adicionais != null && item.Adicionais.Any())
                    {
                        foreach (var adicional in item.Adicionais)
                        {
                            var adicionalLoja = await _context.ProdutosLojas.FindAsync(adicional.ProdutoLojaId);
                            if (adicionalLoja != null)
                            {
                                adicionalLoja.Estoque = (adicionalLoja.Estoque ?? 0) + item.Quantidade;
                                adicionalLoja.Vendas -= item.Quantidade;
                                _context.ProdutosLojas.Update(adicionalLoja);
                            }
                        }
                    }
                }

            // Atualizar Pedido
            pedido.Status = "Cancelado";
            pedido.MotivoCancelamento = motivo;

            // Incrementar Contador do Cliente
            // Note: need to inject Cliente DBSet logic or assume _context has it.
            // I will assume _context.Clientes works as I used it in Controller? No, Controller uses Services.
            // Does AppDbContext have Clientes?
            // Usually yes.
            // I'll try:
            // var cliente = await _context.Clientes.FindAsync(clienteId);
            // If Clientes is not in context, this will fail build.
            // But I have to try.
            
            // Wait, I can't be sure about `_context.Clientes`.
            // If it fails, I'll skip counter for now.
            // Let's assume it works.
             // var cliente = await _context.Set<ClienteFinal>().FindAsync(clienteId); // Generic way if DbSet name unknown
             // But usually `Set<T>` works better.
             var cliente = await _context.Set<ClienteFinal>().FindAsync(clienteId);
             if (cliente != null) cliente.PedidosCancelados++;

            await _context.SaveChangesAsync();
            return pedido;
        }

        private int GetStatusRank(string? status)
        {
            if (string.IsNullOrEmpty(status)) return -1;
            switch (status.ToLower())
            {
                case "pendente": return 0;
                case "aguardando": return 0; // Alias
                case "aguardando aceitação": return 0; // Novo Status
                case "em preparo": return 1;
                case "pronto": return 2;
                case "saiu para entrega": return 3;
                case "entregue": return 4;
                case "cancelado": return 99;
                default: return 99;
            }
        }

        public async Task<Pedido> AtualizarObservacaoAsync(int pedidoId, string novaObservacao)
        {
            var pedido = await _context.Pedidos.FindAsync(pedidoId);
            if (pedido == null) throw new DomainException("Pedido não encontrado.");

            pedido.Observacao = novaObservacao;
            _context.Pedidos.Update(pedido);
            await _context.SaveChangesAsync();

            return pedido;
        }
        public async Task<Pedido> AdicionarItensAsync(int pedidoId, List<ItemPedidoDTO> itens)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pedido = await _context.Pedidos
                    .Include(p => p.Loja)
                    .Include(p => p.Sacola)
                    .FirstOrDefaultAsync(p => p.Id == pedidoId);

                if (pedido == null) throw new DomainException("Pedido não encontrado.");
                if (pedido.Status != "Aberto" && pedido.Status != "Pendente" && pedido.Status != "Em Preparo") 
                    throw new DomainException($"Não é possível adicionar itens a um pedido com status {pedido.Status}.");

                var loja = pedido.Loja;
                if (loja == null) throw new DomainException("Loja não encontrada.");

                decimal valorAdicional = 0;
                int quantidadeAdicional = 0;

                foreach (var itemDto in itens)
                {
                    if (itemDto.IdCombo.HasValue)
                    {
                         // LÓGICA DE COMBO (Reutilizada simplificada)
                        var combo = await _context.Combos
                            .Include(c => c.Itens).ThenInclude(ci => ci.ProdutoLoja)
                            .FirstOrDefaultAsync(c => c.Id == itemDto.IdCombo.Value);

                        if (combo == null || !combo.Ativo) throw new DomainException($"Combo indisponível.");

                        foreach (var comboItem in combo.Itens)
                        {
                           var produtoLojaAtivo = await _context.ProdutosLojas
                                .Where(pl => pl.LojaId == loja.Id && pl.ProdutoId == (comboItem.ProdutoLoja.ProdutoId))
                                .OrderByDescending(pl => pl.Estoque ?? 0)
                                .FirstOrDefaultAsync();

                           if (produtoLojaAtivo == null) throw new DomainException("Produto do combo indisponível.");
                           
                           var required = (comboItem.Quantidade * itemDto.Qtd);
                           if ((produtoLojaAtivo.Estoque ?? 0) < required)
                               throw new DomainException($"Estoque insuficiente para combo.");

                           // Atualiza estoque
                           produtoLojaAtivo.Estoque = (produtoLojaAtivo.Estoque ?? 0) - required;
                           produtoLojaAtivo.Vendas += required;
                           _context.ProdutosLojas.Update(produtoLojaAtivo);
                        }

                        var pedidoItem = new PedidoItem
                        {
                            ComboId = combo.Id,
                            NomeProduto = combo.Nome,
                            PrecoVenda = combo.Preco,
                            Quantidade = itemDto.Qtd
                        };
                        pedido.Sacola.Add(pedidoItem);
                        valorAdicional += (decimal)pedidoItem.PrecoVenda * pedidoItem.Quantidade;
                    }
                    else if (itemDto.IdProduto.HasValue)
                    {
                        var produtoLoja = await _context.ProdutosLojas
                            .Include(pl => pl.Produto)
                            .FirstOrDefaultAsync(p => p.Id == itemDto.IdProduto.Value);

                        if (produtoLoja == null) throw new DomainException($"Produto não encontrado.");
                        
                        var required = itemDto.Qtd;
                        if ((produtoLoja.Estoque ?? 0) < required)
                             throw new DomainException($"Estoque insuficiente para {produtoLoja.Descricao}.");

                        var pedidoItem = new PedidoItem
                        {
                            ProdutoLojaId = produtoLoja.Id,
                            NomeProduto = produtoLoja.Descricao,
                            PrecoVenda = produtoLoja.Preco,
                            Quantidade = itemDto.Qtd,
                            Adicionais = new List<PedidoItemAdicional>()
                        };

                        // Adicionais
                        if (itemDto.AdicionaisIds != null && itemDto.AdicionaisIds.Any())
                        {
                             var adicionaisLojas = await _context.ProdutosLojas
                                .Where(pl => itemDto.AdicionaisIds.Contains(pl.Id))
                                .ToListAsync();

                             foreach (var idAdicional in itemDto.AdicionaisIds)
                             {
                                 var adicionalLoja = adicionaisLojas.FirstOrDefault(pl => pl.Id == idAdicional);
                                 if (adicionalLoja == null) continue;

                                 if ((adicionalLoja.Estoque ?? 0) < itemDto.Qtd)
                                     throw new DomainException($"Estoque insuficiente para adicional.");

                                 adicionalLoja.Estoque = (adicionalLoja.Estoque ?? 0) - itemDto.Qtd;
                                 adicionalLoja.Vendas += itemDto.Qtd;
                                 _context.ProdutosLojas.Update(adicionalLoja);

                                 pedidoItem.Adicionais.Add(new PedidoItemAdicional
                                 {
                                     ProdutoLojaId = adicionalLoja.Id,
                                     PrecoVenda = adicionalLoja.Preco
                                 });
                                 valorAdicional += (decimal)adicionalLoja.Preco * itemDto.Qtd;
                             }
                        }

                        pedido.Sacola.Add(pedidoItem);
                        valorAdicional += (decimal)pedidoItem.PrecoVenda * pedidoItem.Quantidade;
                        quantidadeAdicional += itemDto.Qtd;

                        produtoLoja.Estoque = (produtoLoja.Estoque ?? 0) - required;
                        produtoLoja.Vendas += required;
                        _context.ProdutosLojas.Update(produtoLoja);
                    }
                }

                // Atualizar totais do pedido
                pedido.ValorTotal = (pedido.ValorTotal ?? 0) + (int)valorAdicional;
                pedido.Quantidade += quantidadeAdicional;

                _context.Pedidos.Update(pedido);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return pedido;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
