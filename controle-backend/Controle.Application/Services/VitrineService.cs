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

        public async Task<VitrineDTO?> ObterLojaParaClienteAsync(string lojaIdentifier)
        {
            // 1. Tentar parsear como GUID
            bool isGuid = Guid.TryParse(lojaIdentifier, out Guid lojaId);

            // 2. Usar AsNoTracking() em todas as consultas.
            Loja? loja = null;

            if (isGuid)
            {
               loja = await _context.Lojas
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lojaId);
            }
            else
            {
                // Buscar por nome (Slug simples: substitui espaços por - e lowercase)
                // OBS: Para produção, ideal é ter coluna 'Slug' indexada e única. 
                // Aqui faremos uma busca aproximada para atender o requisito funcional imediato.
                // Trazemos todas as lojas ativas para memória para comparar o slug (não performático para muitos registros, mas resolve agora)
                // Ou melhor: tentar filtrar no banco com ToLower se possível.
                
                var nomeBusca = lojaIdentifier.Replace("-", " ").Trim();
                
                loja = await _context.Lojas
                    .AsNoTracking()
                    .Where(l => l.Nome.ToLower() == nomeBusca.ToLower())
                    .FirstOrDefaultAsync();
            }

            if (loja != null) lojaId = loja.Id; // Garante que temos o ID real se achou pelo nome

            if (loja == null) return null;

            // 2. Buscar todos os produtos da loja para Lookup de Adicionais (Preço/Estoque)
            var todosProdutosLoja = await _context.ProdutosLojas
                .AsNoTracking()
                .Where(pl => pl.LojaId == lojaId)
                .Select(pl => new { pl.ProdutoId, pl.Id, pl.Preco, pl.Descricao, pl.Estoque, ProdutoNome = pl.Produto.Nome, ProdutoDescricao = pl.Produto.Descricao })
                .ToDictionaryAsync(x => x.ProdutoId, x => x);

            // 3. Buscar todos os cardápios ativos da loja (com seus includes: Categorias e Produtos).
            var cardapios = await _context.Cardapios
                .AsNoTracking()
                .Where(c => c.LojaId == lojaId && c.Ativo)
                .Include(c => c.Categorias.OrderBy(cat => cat.OrdemExibicao))
                .ThenInclude(cat => cat.ProdutoCategorias) 
                .ThenInclude(pc => pc.ProdutoLoja)
                .ThenInclude(pl => pl.Produto)
                .ThenInclude(p => p.Adicionais)
                .ThenInclude(pa => pa.ProdutoFilho)
                // Keep original Includes for safety if needed, or replace. 
                // The original "ThenInclude(cat => cat.Produtos)" might still be useful if someone uses direct FK, 
                // but we are switching to ProdutoCategorias. Let's keep both or just add the new chain.
                // EF Core requires separate Include chains for different paths.
                
                // Chain 1: Categoria -> ProdutoCategorias -> ProdutoLoja -> Produto -> Adicionais
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Produtos) 
                .ThenInclude(pl => pl.Produto) 
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Combos)
                .ThenInclude(cb => cb.Itens)
                .ThenInclude(cbi => cbi.ProdutoLoja)
                .ThenInclude(pl => pl.Produto) 
                .ToListAsync();

            // 4. Lógica de Seleção de Cardápio:
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

            // 5. Mapear e retornar o VitrineDTO.
            var vitrineDTO = new VitrineDTO
            {
                LojaId = loja.Id,
                NomeLoja = loja.Nome,
                Descricao = loja.Categoria ?? "Loja", 
                LogoUrl = loja.LogoUrl,
                CapaUrl = loja.CapaUrl,
                Avaliacao = loja.Avaliacao,
                TempoEntregaMin = loja.TempoMinimoEntrega ?? 30,
                TempoEntregaMax = loja.TempoMaximoEntrega ?? 45,
                TaxaEntrega = loja.TaxaEntregaFixa ?? 5.0m,
                Categoria = loja.Categoria ?? "Diversos",
                Aberta = loja.AbertaManualmente ?? (cardapioSelecionado != null),
                LicencaValidaAte = loja.LicencaValidaAte,
                BloqueadaPorFaltaDePagamento = loja.BloqueadaPorFaltaDePagamento
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
                        Produtos = c.ProdutoCategorias
                            .Select(pc => pc.ProdutoLoja)
                            .Where(p => p != null && p.LojaId == lojaId) 
                            .ToList() 
                            .Select(p => 
                            {
                                var prodDto = new ProdutoLojaDTO
                                {
                                    Id = p.Id,
                                    Nome = p.Produto?.Nome ?? p.Descricao,
                                    Descricao = !string.IsNullOrWhiteSpace(p.Descricao) ? p.Descricao : (p.Produto?.Descricao ?? ""),
                                    Preco = p.Preco,
                                    Tipo = !string.IsNullOrEmpty(p.Produto?.Tipo) ? p.Produto.Tipo : "Outros",
                                    UrlImagem = !string.IsNullOrWhiteSpace(p.ImagemUrl) ? p.ImagemUrl : (p.Produto?.URL_Imagem ?? ""), 
                                    Esgotado = p.Estoque <= 0,
                                    LojaId = loja.Id,
                                    Disponivel = p.Disponivel,
                                    Adicionais = p.Produto?.Adicionais?
                                        .Where(pa => todosProdutosLoja.ContainsKey(pa.ProdutoFilhoId)) 
                                        .Select(pa => {
                                            var extraLoja = todosProdutosLoja[pa.ProdutoFilhoId];
                                            return new ProdutoLojaDTO {
                                                Id = extraLoja.Id,
                                                Nome = extraLoja.ProdutoNome ?? extraLoja.Descricao,
                                                Descricao = !string.IsNullOrWhiteSpace(extraLoja.Descricao) ? extraLoja.Descricao : (extraLoja.ProdutoDescricao ?? ""),
                                                Preco = extraLoja.Preco,
                                                Esgotado = (extraLoja.Estoque ?? 0) <= 0,
                                                LojaId = loja.Id
                                            };
                                        })
                                        .Where(ex => !ex.Esgotado) 
                                        .ToList() ?? new List<ProdutoLojaDTO>()
                                };
                                return prodDto;
                            }).ToList(),
                        Combos = c.Combos
                        .Select(cb => new ComboDTO
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
                                NomeProduto = i.ProdutoLoja?.Produto?.Nome ?? i.ProdutoLoja?.Descricao ?? "Item",
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
                    Slug = l.Slug,
                    Descricao = l.Categoria, // Mapping Categoria to Descricao for now as Loja has no Descricao
                    LogoUrl = l.LogoUrl,
                    CapaUrl = l.CapaUrl, 
                    ImagemUrl = l.LogoUrl, // Legacy
                    BannerUrl = l.CapaUrl, // Legacy
                    Avaliacao = l.Avaliacao ?? 4.8, 
                    TempoEntregaMin = l.TempoMinimoEntrega ?? 30,
                    TempoEntregaMax = l.TempoMaximoEntrega ?? 45,
                    TaxaEntrega = l.TaxaEntregaFixa ?? 5.0m,
                    Categoria = l.Categoria ?? "Diversos",
                    Aberta = l.AbertaManualmente ?? true,
                    LicencaValidaAte = l.LicencaValidaAte,
                    BloqueadaPorFaltaDePagamento = l.BloqueadaPorFaltaDePagamento
                })
                .ToListAsync();

            return lojas;
        }
    }
}
