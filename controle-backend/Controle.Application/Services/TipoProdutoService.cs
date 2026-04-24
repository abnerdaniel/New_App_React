using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services;

public class TipoProdutoService : ITipoProdutoService
{
    private readonly AppDbContext _context;

    public TipoProdutoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TipoProdutoDTO>> ListarPorLojaAsync(Guid lojaId)
    {
        var tipos = await _context.TiposProduto
            .Where(t => t.LojaId == lojaId)
            .OrderBy(t => t.Nome)
            .ToListAsync();

        return tipos.Select(MapToDTO);
    }

    public async Task<TipoProdutoDTO> CriarAsync(Guid lojaId, CreateTipoProdutoDTO dto)
    {
        var tipo = new TipoProduto
        {
            LojaId = lojaId,
            Nome = dto.Nome.Trim(),
            Icone = dto.Icone,
            Ativo = true
        };

        _context.TiposProduto.Add(tipo);
        await _context.SaveChangesAsync();
        return MapToDTO(tipo);
    }

    public async Task<TipoProdutoDTO> AtualizarAsync(int id, Guid lojaId, UpdateTipoProdutoDTO dto)
    {
        var tipo = await _context.TiposProduto
            .FirstOrDefaultAsync(t => t.Id == id && t.LojaId == lojaId)
            ?? throw new Exception("Tipo de produto não encontrado.");

        tipo.Nome = dto.Nome.Trim();
        tipo.Icone = dto.Icone;
        tipo.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();
        return MapToDTO(tipo);
    }

    public async Task ExcluirAsync(int id, Guid lojaId)
    {
        var tipo = await _context.TiposProduto
            .FirstOrDefaultAsync(t => t.Id == id && t.LojaId == lojaId)
            ?? throw new Exception("Tipo de produto não encontrado.");

        // Desvincula produtos sem deletar
        var produtos = await _context.ProdutosLojas
            .Where(pl => pl.TipoProdutoId == id)
            .ToListAsync();

        foreach (var pl in produtos)
            pl.TipoProdutoId = null;

        await _context.SaveChangesAsync();

        _context.TiposProduto.Remove(tipo);
        await _context.SaveChangesAsync();
    }

    private static TipoProdutoDTO MapToDTO(TipoProduto t) => new()
    {
        Id = t.Id,
        Nome = t.Nome,
        Icone = t.Icone,
        Ativo = t.Ativo
    };
}
