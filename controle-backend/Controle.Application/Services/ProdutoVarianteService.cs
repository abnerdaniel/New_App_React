using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class ProdutoVarianteService
    {
        private readonly AppDbContext _context;

        public ProdutoVarianteService(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/produto-loja/{id}/variantes
        public async Task<List<ProdutoVarianteDTO>> ListarPorProdutoAsync(int produtoLojaId)
        {
            return await _context.ProdutoVariantes
                .Where(pv => pv.ProdutoLojaId == produtoLojaId)
                .Include(pv => pv.Atributos)
                    .ThenInclude(a => a.VarianteAtributoValor)
                    .ThenInclude(v => v.VarianteAtributo)
                .AsNoTracking()
                .Select(pv => MapToDTO(pv))
                .ToListAsync();
        }

        // POST /api/produto-loja/{id}/gerar-variantes
        // Recebe lista de AtributoIds, retorna o produto cartesiano (grade pré-gerada)
        public async Task<List<ProdutoVarianteDTO>> GerarVariantesAsync(int produtoLojaId, GerarVariantesRequest dto)
        {
            var atributos = await _context.VarianteAtributos
                .Where(a => dto.AtributoIds.Contains(a.Id))
                .Include(a => a.Valores)
                .AsNoTracking()
                .ToListAsync();

            // Produto cartesiano dos valores de cada atributo
            var combinacoes = ProdutoCartesiano(atributos.Select(a => a.Valores.ToList()).ToList());

            // Obter variantes já existentes para este produto
            var existentes = await _context.ProdutoVariantes
                .Where(pv => pv.ProdutoLojaId == produtoLojaId)
                .Include(pv => pv.Atributos)
                .AsNoTracking()
                .ToListAsync();

            var produtoLoja = await _context.ProdutosLojas.FindAsync(produtoLojaId);

            var resultado = new List<ProdutoVarianteDTO>();
            foreach (var combo in combinacoes)
            {
                var valorIds = combo.Select(v => v.Id).OrderBy(id => id).ToList();
                var existente = existentes.FirstOrDefault(pv =>
                    pv.Atributos.Select(a => a.VarianteAtributoValorId).OrderBy(id => id)
                        .SequenceEqual(valorIds));

                resultado.Add(new ProdutoVarianteDTO
                {
                    Id = existente?.Id ?? 0,
                    SKU = existente?.SKU ?? GerarSKU(combo),
                    Preco = existente?.Preco ?? (produtoLoja?.Preco ?? 0),
                    Estoque = existente?.Estoque ?? 0,
                    Disponivel = existente?.Disponivel ?? true,
                    ImagemUrl = existente?.ImagemUrl,
                    Atributos = combo.Select(v => new ProdutoVarianteAtributoDTO
                    {
                        ValorId = v.Id,
                        NomeAtributo = v.VarianteAtributo?.Nome ?? "",
                        Valor = v.Valor,
                        CodigoHex = v.CodigoHex
                    }).ToList()
                });
            }
            return resultado;
        }

        // PUT /api/produto-loja/{id}/variantes — salva o grid editado
        public async Task<List<ProdutoVarianteDTO>> SalvarVariantesAsync(int produtoLojaId, SalvarVariantesRequest dto)
        {
            // Remover variantes antigas
            var antigas = _context.ProdutoVariantes.Where(pv => pv.ProdutoLojaId == produtoLojaId);
            _context.ProdutoVariantes.RemoveRange(antigas);
            await _context.SaveChangesAsync();

            // Inserir novas variantes
            foreach (var item in dto.Variantes)
            {
                var variante = new ProdutoVariante
                {
                    ProdutoLojaId = produtoLojaId,
                    SKU = item.SKU,
                    Preco = (int)item.Preco,
                    Estoque = item.Estoque,
                    Disponivel = item.Disponivel,
                    ImagemUrl = item.ImagemUrl
                };

                foreach (var valorId in item.ValorIds)
                {
                    variante.Atributos.Add(new ProdutoVarianteAtributo { VarianteAtributoValorId = valorId });
                }
                _context.ProdutoVariantes.Add(variante);
            }
            await _context.SaveChangesAsync();

            return await ListarPorProdutoAsync(produtoLojaId);
        }

        // PATCH /api/variantes/{id}/estoque
        public async Task<bool> AtualizarEstoqueAsync(int varianteId, AtualizarEstoqueVarianteRequest dto)
        {
            var variante = await _context.ProdutoVariantes.FindAsync(varianteId);
            if (variante == null) return false;
            variante.Estoque = dto.Estoque;
            variante.Disponivel = dto.Estoque > 0;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Valida e decrementa o estoque de uma variante. Lança exceção se esgotada.
        /// </summary>
        public async Task DecrementarEstoqueAsync(int varianteId, int quantidade = 1)
        {
            var variante = await _context.ProdutoVariantes.FindAsync(varianteId)
                ?? throw new InvalidOperationException("Variante não encontrada.");

            if (variante.Estoque < quantidade)
                throw new InvalidOperationException(
                    $"Estoque insuficiente para a variante '{variante.SKU}'. Disponível: {variante.Estoque}.");

            variante.Estoque -= quantidade;
            if (variante.Estoque <= 0)
                variante.Disponivel = false;

            await _context.SaveChangesAsync();
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static ProdutoVarianteDTO MapToDTO(ProdutoVariante pv) => new()
        {
            Id = pv.Id,
            SKU = pv.SKU,
            Preco = pv.Preco,
            Estoque = pv.Estoque,
            Disponivel = pv.Disponivel,
            ImagemUrl = pv.ImagemUrl,
            Atributos = pv.Atributos.Select(a => new ProdutoVarianteAtributoDTO
            {
                ValorId = a.VarianteAtributoValorId,
                NomeAtributo = a.VarianteAtributoValor?.VarianteAtributo?.Nome ?? "",
                Valor = a.VarianteAtributoValor?.Valor ?? "",
                CodigoHex = a.VarianteAtributoValor?.CodigoHex
            }).ToList()
        };

        private static string GerarSKU(List<VarianteAtributoValor> combo)
            => string.Join("-", combo.Select(v => v.Valor.ToUpper().Replace(" ", ""))).Replace("#", "");

        /// <summary>Produto Cartesiano de listas de valores de atributos.</summary>
        private static List<List<VarianteAtributoValor>> ProdutoCartesiano(List<List<VarianteAtributoValor>> sets)
        {
            var result = new List<List<VarianteAtributoValor>> { new() };
            foreach (var set in sets)
            {
                result = result
                    .SelectMany(r => set.Select(v => new List<VarianteAtributoValor>(r) { v }))
                    .ToList();
            }
            return result;
        }
    }
}
