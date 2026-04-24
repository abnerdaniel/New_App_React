using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class GrupoOpcaoService : IGrupoOpcaoService
    {
        private readonly AppDbContext _context;

        public GrupoOpcaoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GrupoOpcaoDTO>> ListarPorProdutoAsync(int produtoLojaId)
        {
            return await _context.GruposOpcao
                .AsNoTracking()
                .Where(g => g.ProdutoLojaId == produtoLojaId)
                .OrderBy(g => g.Ordem)
                .Include(g => g.Itens.OrderBy(i => i.Ordem))
                .Select(g => MapGrupoToDTO(g))
                .ToListAsync();
        }

        public async Task<GrupoOpcaoDTO> CriarGrupoAsync(int produtoLojaId, CreateGrupoOpcaoRequest request)
        {
            var grupo = new GrupoOpcao
            {
                ProdutoLojaId = produtoLojaId,
                Nome = request.Nome,
                Ordem = request.Ordem,
                MinSelecao = request.MinSelecao,
                MaxSelecao = request.MaxSelecao,
                Obrigatorio = request.Obrigatorio
            };
            _context.GruposOpcao.Add(grupo);
            await _context.SaveChangesAsync();
            return MapGrupoToDTO(grupo);
        }

        public async Task<GrupoOpcaoDTO> AtualizarGrupoAsync(int grupoId, UpdateGrupoOpcaoRequest request)
        {
            var grupo = await _context.GruposOpcao
                .Include(g => g.Itens)
                .FirstOrDefaultAsync(g => g.Id == grupoId)
                ?? throw new System.Exception("Grupo não encontrado.");

            grupo.Nome = request.Nome;
            grupo.Ordem = request.Ordem;
            grupo.MinSelecao = request.MinSelecao;
            grupo.MaxSelecao = request.MaxSelecao;
            grupo.Obrigatorio = request.Obrigatorio;

            await _context.SaveChangesAsync();
            return MapGrupoToDTO(grupo);
        }

        public async Task DeletarGrupoAsync(int grupoId)
        {
            var grupo = await _context.GruposOpcao.FindAsync(grupoId)
                ?? throw new System.Exception("Grupo não encontrado.");
            _context.GruposOpcao.Remove(grupo);
            await _context.SaveChangesAsync();
        }

        public async Task<OpcaoItemDTO> AdicionarItemAsync(int grupoId, CreateOpcaoItemRequest request)
        {
            var item = new OpcaoItem
            {
                GrupoOpcaoId = grupoId,
                Nome = request.Nome,
                Preco = request.Preco,
                Ordem = request.Ordem,
                Ativo = request.Ativo
            };
            _context.OpcaoItens.Add(item);
            await _context.SaveChangesAsync();
            return MapItemToDTO(item);
        }

        public async Task<OpcaoItemDTO> AtualizarItemAsync(int itemId, UpdateOpcaoItemRequest request)
        {
            var item = await _context.OpcaoItens.FindAsync(itemId)
                ?? throw new System.Exception("Item não encontrado.");

            item.Nome = request.Nome;
            item.Preco = request.Preco;
            item.Ordem = request.Ordem;
            item.Ativo = request.Ativo;

            await _context.SaveChangesAsync();
            return MapItemToDTO(item);
        }

        public async Task DeletarItemAsync(int itemId)
        {
            var item = await _context.OpcaoItens.FindAsync(itemId)
                ?? throw new System.Exception("Item não encontrado.");
            _context.OpcaoItens.Remove(item);
            await _context.SaveChangesAsync();
        }

        private static GrupoOpcaoDTO MapGrupoToDTO(GrupoOpcao g) => new()
        {
            Id = g.Id,
            ProdutoLojaId = g.ProdutoLojaId,
            Nome = g.Nome,
            Ordem = g.Ordem,
            MinSelecao = g.MinSelecao,
            MaxSelecao = g.MaxSelecao,
            Obrigatorio = g.Obrigatorio,
            Itens = g.Itens?.Select(MapItemToDTO).ToList() ?? new()
        };

        private static OpcaoItemDTO MapItemToDTO(OpcaoItem i) => new()
        {
            Id = i.Id,
            GrupoOpcaoId = i.GrupoOpcaoId,
            Nome = i.Nome,
            Preco = i.Preco,
            Ordem = i.Ordem,
            Ativo = i.Ativo
        };
    }
}
