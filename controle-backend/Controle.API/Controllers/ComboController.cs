using System;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/combos")]
    [Authorize]
    public class ComboController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComboController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> CriarCombo([FromBody] CreateComboDTO dto)
        {
            var combo = new Combo
            {
                LojaId = dto.LojaId,
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Preco = dto.Preco,
                ImagemUrl = dto.ImagemUrl,
                Ativo = dto.Ativo,
                CategoriaId = dto.CategoriaId
            };

            foreach (var itemDto in dto.Itens)
            {
                combo.Itens.Add(new ComboItem
                {
                    ProdutoLojaId = itemDto.ProdutoLojaId,
                    Quantidade = itemDto.Quantidade
                });
            }

            _context.Combos.Add(combo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObterCombo), new { id = combo.Id }, combo);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterCombo(int id)
        {
            var combo = await _context.Combos
                .Include(c => c.Itens)
                .ThenInclude(i => i.ProdutoLoja)
                .ThenInclude(pl => pl.Produto)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (combo == null) return NotFound();

            var dto = new ComboDTO
            {
                Id = combo.Id,
                Nome = combo.Nome,
                Descricao = combo.Descricao,
                Preco = combo.Preco,
                ImagemUrl = combo.ImagemUrl,
                Ativo = combo.Ativo,
                CategoriaId = combo.CategoriaId,
                Itens = combo.Itens.Select(i => new ComboItemDTO
                {
                    Id = i.Id,
                    ProdutoLojaId = i.ProdutoLojaId,
                    Quantidade = i.Quantidade,
                    NomeProduto = !string.IsNullOrEmpty(i.ProdutoLoja?.Produto?.Nome)
                        ? i.ProdutoLoja.Produto.Nome
                        : (i.ProdutoLoja?.Produto?.Nome ?? "Produto Indisponível")
                }).ToList()
            };

            return Ok(dto);
        }
        
        [HttpGet("loja/{lojaId}")]
        public async Task<IActionResult> ListarCombos(Guid lojaId)
        {
             var combos = await _context.Combos
                .Where(c => c.LojaId == lojaId)
                .Include(c => c.Itens)
                .ThenInclude(i => i.ProdutoLoja)
                .ThenInclude(pl => pl.Produto)
                .ToListAsync();

             // Map to DTO
             var dtos = combos.Select(c => new ComboDTO
             {
                 Id = c.Id,
                 Nome = c.Nome,
                 Descricao = c.Descricao,
                 Preco = c.Preco,
                 ImagemUrl = c.ImagemUrl,
                 Ativo = c.Ativo,
                 CategoriaId = c.CategoriaId,
                 Itens = c.Itens.Select(i => new ComboItemDTO
                 {
                     Id = i.Id,
                     ProdutoLojaId = i.ProdutoLojaId,
                     Quantidade = i.Quantidade,
                     // Logic: Custom Description OR Global Product Name OR Fallback
                     NomeProduto = !string.IsNullOrEmpty(i.ProdutoLoja?.Produto?.Nome) 
                        ? i.ProdutoLoja.Produto.Nome 
                        : (i.ProdutoLoja?.Produto?.Nome ?? "Produto Indisponível")
                 }).ToList()
             });
                
             return Ok(dtos);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarCombo(int id, [FromBody] CreateComboDTO dto)
        {
            var combo = await _context.Combos.Include(c => c.Itens).FirstOrDefaultAsync(c => c.Id == id);
            if (combo == null) return NotFound();

            combo.Nome = dto.Nome;
            combo.Descricao = dto.Descricao;
            combo.Preco = dto.Preco;
            combo.ImagemUrl = dto.ImagemUrl;
            combo.Ativo = dto.Ativo;
            combo.CategoriaId = dto.CategoriaId;

            // Simple update: clear and re-add items (not efficient but safe)
            // Ideally should differentiate updates, additions, deletions.
            _context.ComboItems.RemoveRange(combo.Itens);
            combo.Itens.Clear();

            foreach (var itemDto in dto.Itens)
            {
                combo.Itens.Add(new ComboItem
                {
                    ComboId = combo.Id,
                    ProdutoLojaId = itemDto.ProdutoLojaId,
                    Quantidade = itemDto.Quantidade
                });
            }

            await _context.SaveChangesAsync();
            return Ok(combo);
        }

        [HttpPatch("{id}/categoria")]
        public async Task<IActionResult> AtualizarCategoriaCombo(int id, [FromBody] UpdateComboCategoriaDTO dto)
        {
            var combo = await _context.Combos.FindAsync(id);
            if (combo == null) return NotFound();

            combo.CategoriaId = dto.CategoriaId;
            await _context.SaveChangesAsync();

            return Ok(combo);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirCombo(int id)
        {
            var combo = await _context.Combos.FindAsync(id);
            if (combo == null) return NotFound();

            _context.Combos.Remove(combo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
