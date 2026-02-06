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
    }
}
