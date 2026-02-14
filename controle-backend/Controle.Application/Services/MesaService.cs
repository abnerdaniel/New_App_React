using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services;

public class MesaService : IMesaService
{
    private readonly AppDbContext _context;

    public MesaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Mesa>> ListarMesasAsync(Guid lojaId)
    {
        return await _context.Mesas
            .Where(m => m.LojaId == lojaId)
            .Include(m => m.PedidoAtual)
                .ThenInclude(p => p.Sacola) // Itens do pedido
                    .ThenInclude(i => i.ProdutoLoja) // Preço/Produto
            .OrderBy(m => m.Numero)
            .ToListAsync();
    }

// ... (GetMesaByIdAsync similarly if needed)

// ...

    public async Task<Mesa> AbrirMesaAsync(int mesaId, string? nomeCliente)
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
                ClienteId = 1, // Assume 1 for now
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
            mesa.DataAbertura = DateTime.Now; // Set DataAbertura
            
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
}
