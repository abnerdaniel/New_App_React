using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Controle.Application.Services;

public class MesaService : IMesaService
{
    private readonly AppDbContext _context;
    private readonly IServiceProvider _serviceProvider;

    public MesaService(AppDbContext context, IServiceProvider serviceProvider)
    {
        _context = context;
        _serviceProvider = serviceProvider;
    }

    public async Task<IEnumerable<Mesa>> ListarMesasAsync(Guid lojaId)
    {
        return await _context.Mesas
            .Where(m => m.LojaId == lojaId)
            .Include(m => m.PedidoAtual)
                .ThenInclude(p => p.Sacola)
                    .ThenInclude(i => i.ProdutoLoja)
                        .ThenInclude(pl => pl!.Produto)
            .Include(m => m.PedidoAtual)
                .ThenInclude(p => p.Sacola)
                    .ThenInclude(i => i.Combo)
                        .ThenInclude(c => c!.Itens)
                            .ThenInclude(ci => ci.ProdutoLoja)
                                .ThenInclude(pl => pl!.Produto)
            .Include(m => m.PedidoAtual)
                .ThenInclude(p => p.Funcionario)
            .OrderBy(m => m.Numero)
            .ToListAsync();
    }

// ... (GetMesaByIdAsync similarly if needed)

// ...

    public async Task<Mesa> AbrirMesaAsync(int mesaId, string? nomeCliente, int? funcionarioId)
    {
        // ... (transaction start)
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var mesa = await _context.Mesas.FindAsync(mesaId);
            if (mesa == null) throw new DomainException("Mesa não encontrada.");
            
            if (mesa.Status != "Livre") throw new DomainException($"Mesa {mesa.Numero} já está ocupada ou não está livre.");

            // Criar Pedido
            var pedido = new Pedido
            {
                LojaId = mesa.LojaId,
                NumeroMesa = mesa.Numero,
                ClienteId = null,
                FuncionarioId = funcionarioId,
                Descricao = $"Mesa {mesa.Numero} - {nomeCliente ?? "Cliente"}",
                DataVenda = DateTime.UtcNow,
                Status = "Aberto", 
                IsRetirada = false,
                Observacao = nomeCliente != null ? $"Cliente: {nomeCliente}" : null
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            // Atualizar Mesa
            mesa.Status = "Ocupada";
            mesa.ClienteNomeTemporario = nomeCliente;
            mesa.PedidoAtualId = pedido.Id;
            mesa.DataAbertura = DateTime.UtcNow; // Set DataAbertura to UTC for timestamptz column
            
            _context.Mesas.Update(mesa);
            await _context.SaveChangesAsync();
            
            await transaction.CommitAsync();
            
            return mesa;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task LiberarMesaAsync(int mesaId)
    {
        var mesa = await _context.Mesas.Include(m => m.PedidoAtual).FirstOrDefaultAsync(m => m.Id == mesaId);
        if (mesa == null) throw new DomainException("Mesa não encontrada.");

        if (mesa.PedidoAtual != null && mesa.PedidoAtual.Status == "Aberto")
        {
             mesa.PedidoAtual.Status = "Concluido";
        }

        mesa.Status = "Livre";
        mesa.PedidoAtualId = null;
        mesa.ClienteNomeTemporario = null;
        mesa.DataAbertura = null; // Clear DataAbertura

        _context.Mesas.Update(mesa);
        await _context.SaveChangesAsync();
    }

    public async Task<Mesa?> GetMesaByIdAsync(int id)
    {
        return await _context.Mesas
            .Include(m => m.PedidoAtual)
                .ThenInclude(p => p.Sacola)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task ConfigurarMesasAsync(Guid lojaId, int quantidade)
    {
        // Busca as mesas existentes
        var mesasExistentes = await _context.Mesas
            .Where(m => m.LojaId == lojaId)
            .OrderBy(m => m.Numero)
            .ToListAsync();

        int maxNumeroExistente = mesasExistentes.Any() ? mesasExistentes.Max(m => m.Numero) : 0;
        int quantidadeAtual = mesasExistentes.Count;

        // Se precisa criar mais
        if (quantidade > quantidadeAtual)
        {
            // Estrategia simples: criar novas mesas começando do 'ultimo numero + 1' 
            // ou preencher buracos? Vamos simplificar: continuar a sequencia.
            // Mas espera, se configuro "20 mesas", eu quero mesas de 1 a 20.
            
            // Vamos verificar quais numeros de 1 a Quantidade estão faltando.
            var numerosExistentes = mesasExistentes.Select(m => m.Numero).ToHashSet();
            var novasMesas = new List<Mesa>();

            for (int i = 1; i <= quantidade; i++)
            {
                if (!numerosExistentes.Contains(i))
                {
                    novasMesas.Add(new Mesa
                    {
                        LojaId = lojaId,
                        Numero = i,
                        Status = "Livre"
                    });
                }
            }
            
            if (novasMesas.Any())
            {
                _context.Mesas.AddRange(novasMesas);
                await _context.SaveChangesAsync();
            }
        }
        else if (quantidade < quantidadeAtual)
        {
             // Opcional: Remover as excedentes? 
             // Regra de negocio indefinida. Melhor não deletar mesas que podem ter historico ou estar ocupadas.
             // Vamos apenas ignorar por enquanto ou lançar aviso.
             // O usuario pediu "Configurar quantidade", subentende-se que quer ver X mesas.
             // Por segurança, não deletamos automaticamente.
        }
    }

    public async Task AtualizarApelidoAsync(int id, string apelido)
    {
        var mesa = await _context.Mesas.FindAsync(id);
        if (mesa == null) throw new DomainException("Mesa não encontrada.");
        
        mesa.Nome = apelido;
        _context.Mesas.Update(mesa);
        await _context.SaveChangesAsync();
    }

    public async Task<Mesa> AtualizarStatusAsync(int mesaId, string status)
    {
        var mesa = await _context.Mesas.FindAsync(mesaId);
        if (mesa == null) throw new DomainException("Mesa não encontrada.");
        
        mesa.Status = status;
        _context.Mesas.Update(mesa);
        await _context.SaveChangesAsync();
        return mesa;
    }

    public async Task RemoverItemPedidoAsync(int pedidoItemId)
    {
        var item = await _context.Set<PedidoItem>().FindAsync(pedidoItemId);
        if (item == null) throw new DomainException("Item não encontrado.");

        var pedido = await _context.Pedidos.FindAsync(item.PedidoId);
        if (pedido == null || pedido.Status != "Aberto")
            throw new DomainException("Pedido não encontrado ou já fechado.");

        _context.Set<PedidoItem>().Remove(item);
        await _context.SaveChangesAsync();

        // Recalcular Valor Total do Pedido
        using (var scope = _serviceProvider.CreateScope())
        {
            var pedidoService = scope.ServiceProvider.GetRequiredService<IPedidoService>();
            await pedidoService.RecalcularValorTotalAsync(item.PedidoId);
        }
    }

    public async Task AplicarDescontoAsync(int pedidoId, int desconto)
    {
        var pedido = await _context.Pedidos.FindAsync(pedidoId);
        if (pedido == null) throw new DomainException("Pedido não encontrado.");
        if (pedido.Status != "Aberto")
            throw new DomainException("Não é possível aplicar desconto em pedido fechado.");

        pedido.Desconto = desconto;
        _context.Pedidos.Update(pedido);
        await _context.SaveChangesAsync();

        // Recalcular Valor Total do Pedido
        using (var scope = _serviceProvider.CreateScope())
        {
            var pedidoService = scope.ServiceProvider.GetRequiredService<IPedidoService>();
            await pedidoService.RecalcularValorTotalAsync(pedidoId);
        }
    }

    public async Task<IEnumerable<Controle.Application.DTOs.ProdutoLojaDto>> ListarProdutosLojaAsync(Guid lojaId)
    {
        var produtos = await _context.Set<ProdutoLoja>()
            .Where(pl => pl.LojaId == lojaId)
            .Include(pl => pl.Produto)
            .Include(pl => pl.Categoria)
            .Select(pl => new Controle.Application.DTOs.ProdutoLojaDto {
                Id = pl.Id,
                Nome = pl.Produto != null ? pl.Produto.Nome : pl.Descricao,
                Preco = pl.Preco,
                Descricao = pl.Descricao,
                ImagemUrl = pl.ImagemUrl ?? (pl.Produto != null ? pl.Produto.URL_Imagem : null),
                CategoriaNome = pl.Categoria != null ? pl.Categoria.Nome : (pl.Produto != null ? pl.Produto.Tipo : "Outros"),
                IsCombo = false
            })
            .ToListAsync();

        var combos = await _context.Combos
            .Where(c => c.LojaId == lojaId && c.Ativo)
            .Select(c => new Controle.Application.DTOs.ProdutoLojaDto {
                Id = c.Id,
                Nome = c.Nome,
                Preco = c.Preco,
                Descricao = c.Descricao ?? "Combo",
                ImagemUrl = c.ImagemUrl,
                CategoriaNome = "Combos",
                IsCombo = true
            })
            .ToListAsync();

        return produtos.Concat(combos).OrderBy(p => p.Nome);
    }

    public async Task AdicionarItemPedidoAsync(int pedidoId, int? produtoLojaId, int? comboId, int quantidade)
    {
        // Delegate to PedidoService to ensure consistent validation, stock calculation, and price updating.
        using (var scope = _serviceProvider.CreateScope())
        {
            var pedidoService = scope.ServiceProvider.GetRequiredService<IPedidoService>();
            var itens = new List<Controle.Application.DTOs.ItemPedidoDTO>();

            if (comboId.HasValue)
            {
                itens.Add(new Controle.Application.DTOs.ItemPedidoDTO { IdCombo = comboId.Value, Qtd = quantidade });
            }
            else if (produtoLojaId.HasValue)
            {
                itens.Add(new Controle.Application.DTOs.ItemPedidoDTO { IdProduto = produtoLojaId.Value, Qtd = quantidade });
            }
            else
            {
                throw new DomainException("Produto ou Combo deve ser informado.");
            }

            await pedidoService.AdicionarItensAsync(pedidoId, itens);
        }

        // Trigger Mesa Recalc
        var pedido = await _context.Pedidos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == pedidoId);
        if (pedido != null && pedido.NumeroMesa.HasValue)
        {
             await RecalcularStatusMesaAsync(pedido.NumeroMesa.Value);
        }
    }

    public async Task<Pedido> AtualizarStatusItemPedidoAsync(int pedidoItemId, string status)
    {
        var item = await _context.Set<PedidoItem>().FindAsync(pedidoItemId);
        if (item == null) throw new DomainException("Item não encontrado.");

        item.Status = status;
        _context.Set<PedidoItem>().Update(item);
        await _context.SaveChangesAsync();
        
        // Recalculate Mesa status
        var pedido = await _context.Pedidos.FindAsync(item.PedidoId);
        if (pedido != null && pedido.NumeroMesa.HasValue)
        {
             await RecalcularStatusMesaAsync(pedido.NumeroMesa.Value);
        }

        return pedido;
    }
        public async Task RecalcularStatusMesaAsync(int mesaId)
        {
            var mesa = await _context.Mesas
                .Include(m => m.PedidoAtual)
                .ThenInclude(p => p.Sacola)
                .FirstOrDefaultAsync(m => m.Id == mesaId);

            if (mesa == null) return;
            if (mesa.PedidoAtual == null || mesa.PedidoAtual.Status == "Cancelado" || mesa.PedidoAtual.Status == "Concluido")
            {
                if (mesa.Status != "Livre")
                {
                    mesa.Status = "Livre";
                    _context.Mesas.Update(mesa);
                    await _context.SaveChangesAsync();
                }
                return;
            }

            // Lógica de Status da Mesa baseada nos Itens
            var itens = mesa.PedidoAtual.Sacola;
            string novoStatus = "Ocupada"; // Default if items exist

            // Se tem algum item não entregue (Pendente, Em Preparo, Pronto) -> Esperando
            if (itens.Any(i => i.Status != "Entregue" && i.Status != "Cancelado"))
            {
                novoStatus = "Esperando";
            }
            else 
            {
                // Todos entregues ou cancelados -> Ocupada (Comendo)
                novoStatus = "Ocupada";
            }

            if (mesa.Status != novoStatus && mesa.Status != "Chamado" && mesa.Status != "Pagamento") 
            {
                mesa.Status = novoStatus;
                _context.Mesas.Update(mesa);
                await _context.SaveChangesAsync();
            }
        }
    }

