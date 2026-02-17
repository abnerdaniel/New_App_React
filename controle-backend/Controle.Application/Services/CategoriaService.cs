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
    public class CategoriaService : ICategoriaService
    {
        private readonly AppDbContext _context;

        public CategoriaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CategoriaSimplesDTO> CriarCategoriaAsync(CreateCategoriaDTO dto)
        {
            var categoria = new Categoria
            {
                Nome = dto.Nome,
                CardapioId = dto.CardapioId,
                OrdemExibicao = dto.OrdemExibicao
            };

            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();
            return MapToDTO(categoria);
        }

        public async Task<CategoriaSimplesDTO> AtualizarCategoriaAsync(int id, UpdateCategoriaDTO dto)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null) throw new System.Exception("Categoria não encontrada.");

            categoria.Nome = dto.Nome;
            categoria.OrdemExibicao = dto.OrdemExibicao;

            await _context.SaveChangesAsync();
            return MapToDTO(categoria);
        }

        public async Task ExcluirCategoriaAsync(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null) throw new System.Exception("Categoria não encontrada.");
            
            // 1. Remover vínculos com Produtos (ProdutoCategoria - Many-to-Many)
            var vinculosProdutos = await _context.ProdutoCategorias.Where(pc => pc.CategoriaId == id).ToListAsync();
            _context.ProdutoCategorias.RemoveRange(vinculosProdutos);

            // 1.1 Remover vínculo direto na tabela ProdutoLoja (Legacy/Simple approach)
            var produtosVinculados = await _context.ProdutosLojas.Where(pl => pl.CategoriaId == id).ToListAsync();
            foreach(var pl in produtosVinculados)
            {
                pl.CategoriaId = null;
            }

            // 2. Desvincular Combos (Setar CategoriaId = null)
            var combosVinculados = await _context.Combos.Where(c => c.CategoriaId == id).ToListAsync();
            foreach(var combo in combosVinculados)
            {
                combo.CategoriaId = null;
            }

            // Save updates to relationships FIRST to satisfy FK constraints
            await _context.SaveChangesAsync();

            // 3. Excluir a categoria
             _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<CategoriaSimplesDTO>> ListarPorCardapioAsync(int cardapioId)
        {
            var list = await _context.Categorias
                .Where(c => c.CardapioId == cardapioId)
                .OrderBy(c => c.OrdemExibicao)
                .ToListAsync();
            
            return list.Select(MapToDTO);
        }

        public async Task<CategoriaSimplesDTO?> ObterPorIdAsync(int id)
        {
             var cat = await _context.Categorias.FindAsync(id);
             return cat == null ? null : MapToDTO(cat);
        }

        private CategoriaSimplesDTO MapToDTO(Categoria c) 
        {
            return new CategoriaSimplesDTO 
            {
                Id = c.Id,
                Nome = c.Nome,
                CardapioId = c.CardapioId,
                OrdemExibicao = c.OrdemExibicao
            };
        }

        public async Task ReordenarCategoriasAsync(List<KeyValuePair<int, int>> ordem)
        {
            if (ordem == null || !ordem.Any()) return;

            var ids = ordem.Select(x => x.Key).ToList();
            var categorias = await _context.Categorias.Where(c => ids.Contains(c.Id)).ToListAsync();

            foreach (var item in ordem)
            {
                var categoria = categorias.FirstOrDefault(c => c.Id == item.Key);
                if (categoria != null)
                {
                    categoria.OrdemExibicao = item.Value;
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
