using System;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class VitrineService : IVitrineService
    {
        private readonly AppDbContext _context;

        public VitrineService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<VitrineDTO?> ObterLojaParaClienteAsync(Guid lojaId)
        {
            // 1. Usar AsNoTracking() em todas as consultas.
            var loja = await _context.Lojas
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lojaId);

            if (loja == null) return null;

            // 2. Buscar todos os cardápios ativos da loja (com seus includes: Categorias e Produtos).
            var cardapios = await _context.Cardapios
                .AsNoTracking()
                .Where(c => c.LojaId == lojaId && c.Ativo)
                .Include(c => c.Categorias.OrderBy(cat => cat.OrdemExibicao))
                .ThenInclude(cat => cat.Produtos)
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Combos)
                .ThenInclude(cb => cb.Itens)
                .ThenInclude(cbi => cbi.ProdutoLoja) // Optional: for description/price calculation if needed? Combo has fixed price.
                .ToListAsync();

            // 3. Lógica de Seleção de Cardápio:
            var agora = DateTime.Now;
            var diaSemanaAtual = (int)agora.DayOfWeek; // 0 = Dom, 1 = Seg, ...
            var horaAtual = agora.TimeOfDay;

            Cardapio? cardapioSelecionado = null;

            // Tenta encontrar um cardápio específico que atenda aos critérios de dia e horário
            foreach (var cardapio in cardapios)
            {
                // Verifica dia da semana
                if (!string.IsNullOrEmpty(cardapio.DiasSemana))
                {
                    var dias = cardapio.DiasSemana.Split(',').Select(d => int.Parse(d.Trim())).ToList();
                    if (!dias.Contains(diaSemanaAtual)) continue;
                }

                // Verifica Validade (Datas)
                if (cardapio.DataInicio.HasValue && agora.Date < cardapio.DataInicio.Value.Date) continue;
                if (cardapio.DataFim.HasValue && agora.Date > cardapio.DataFim.Value.Date) continue;

                // Verifica horário (se definido)
                if (cardapio.HorarioInicio.HasValue && cardapio.HorarioFim.HasValue)
                {
                    if (horaAtual >= cardapio.HorarioInicio.Value && horaAtual <= cardapio.HorarioFim.Value)
                    {
                        cardapioSelecionado = cardapio;
                        break; 
                    }
                }
            }

            // Se não encontrou específico, tenta o Principal
            if (cardapioSelecionado == null)
            {
                cardapioSelecionado = cardapios.FirstOrDefault(c => c.Principal);
            }

            // 4. Mapear e retornar o VitrineDTO.
            var vitrineDTO = new VitrineDTO
            {
                LojaId = loja.Id,
                NomeLoja = loja.Nome,
                NomeLoja = loja.Nome,
                Aberta = loja.AbertaManualmente ?? (cardapioSelecionado != null) // Respeita manual, senão verifica cardápio
            };

            if (cardapioSelecionado != null)
            {
                vitrineDTO.Cardapio = new CardapioDTO
                {
                    Id = cardapioSelecionado.Id,
                    Nome = cardapioSelecionado.Nome,
                    Categorias = cardapioSelecionado.Categorias.Select(c => new CategoriaDTO
                    {
                        Id = c.Id,
                        Nome = c.Nome,
                        Produtos = c.Produtos.Select(p => new ProdutoLojaDTO
                        {
                            Id = p.Id,
                            Nome = p.Descricao, // Usando Descricao como Nome se não tiver Nome específico no ProdutoLoja, ou ajustar conforme Entidade
                            Descricao = p.Descricao,
                            Preco = p.Preco,
                            UrlImagem = "", 
                            Esgotado = p.Estoque <= 0,
                            LojaId = loja.Id
                        }).ToList(),
                        Combos = c.Combos.Where(cb => cb.Ativo).Select(cb => new ComboDTO
                        {
                            Id = cb.Id,
                            Nome = cb.Nome,
                            Descricao = cb.Descricao,
                            Preco = cb.Preco,
                            ImagemUrl = cb.ImagemUrl,
                            Ativo = cb.Ativo,
                            Itens = cb.Itens.Select(i => new ComboItemDTO
                            {
                                Id = i.Id,
                                ProdutoLojaId = i.ProdutoLojaId,
                                NomeProduto = i.ProdutoLoja?.Descricao ?? "Item",
                                Quantidade = i.Quantidade
                            }).ToList()
                        }).ToList()
                    }).ToList()
                };
            }

            return vitrineDTO;
        }

        public async Task<List<LojaResumoDTO>> ListarLojasAtivasAsync()
        {
            var lojas = await _context.Lojas
                .AsNoTracking()
                .Where(l => l.Ativo) // Filtrar apenas ativas
                .Select(l => new LojaResumoDTO
                {
                    Id = l.Id,
                    Nome = l.Nome,
                    Descricao = "",
                    ImagemUrl = l.LogoUrl,
                    BannerUrl = l.LogoUrl, // Fallback pois não tem Capa
                    Avaliacao = 4.8, 
                    TempoEntregaMin = l.TempoMinimoEntrega ?? 30,
                    TempoEntregaMax = l.TempoMaximoEntrega ?? 45,
                    TaxaEntrega = l.TaxaEntregaFixa ?? 5.0m,
                    Categoria = "Diversos", // Não tem categoria na entidade Loja
                    Aberta = l.AbertaManualmente ?? true
                })
                .ToListAsync();

            return lojas;
        }
    }
}
