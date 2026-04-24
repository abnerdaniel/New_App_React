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
                
                // Include Imagens e Variantes do ProdutoLoja
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.ProdutoCategorias)
                .ThenInclude(pc => pc.ProdutoLoja)
                .ThenInclude(pl => pl.Imagens)
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.ProdutoCategorias)
                .ThenInclude(pc => pc.ProdutoLoja)
                .ThenInclude(pl => pl.Variantes)
                .ThenInclude(v => v.Atributos)
                .ThenInclude(pa => pa.VarianteAtributoValor)
                .ThenInclude(vav => vav.VarianteAtributo)
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.ProdutoCategorias)
                .ThenInclude(pc => pc.ProdutoLoja)
                .ThenInclude(pl => pl.GruposOpcao)
                .ThenInclude(g => g.Itens)

                // Chain 1: Categoria -> ProdutoCategorias -> ProdutoLoja -> Produto -> Adicionais
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Produtos) 
                .ThenInclude(pl => pl.Produto) 
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Combos)
                .ThenInclude(cb => cb.Itens)
                .ThenInclude(cbi => cbi.ProdutoLoja)
                .ThenInclude(pl => pl.Produto)
                .Include(c => c.Categorias)
                .ThenInclude(cat => cat.Combos)
                .ThenInclude(cb => cb.Etapas)
                .ThenInclude(e => e.Opcoes)
                .ThenInclude(o => o.ProdutoLoja)
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
                BloqueadaPorFaltaDePagamento = loja.BloqueadaPorFaltaDePagamento,
                Telefone = loja.Telefone,
                WhatsApp = loja.WhatsApp,
                Logradouro = loja.Logradouro,
                Numero = loja.Numero,
                Bairro = loja.Bairro,
                Cidade = loja.Cidade,
                Estado = loja.Estado,
                Cep = loja.Cep,
                Complemento = loja.Complemento
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
                                    AdicionaisDetalhes = p.Produto?.Adicionais?
                                        .Where(pa => todosProdutosLoja.ContainsKey(pa.ProdutoFilhoId))
                                        .Select(pa => new CreateProdutoAdicionalDTO {
                                            ProdutoFilhoId = todosProdutosLoja[pa.ProdutoFilhoId].Id,
                                            QuantidadeMinima = pa.QuantidadeMinima,
                                            QuantidadeMaxima = pa.QuantidadeMaxima,
                                            PrecoOverride = pa.PrecoOverride
                                        }).ToList() ?? new List<CreateProdutoAdicionalDTO>(),
                                    Imagens = p.Imagens?.Select(img => new ProdutoImagemDTO {
                                        Id = img.Id,
                                        Url = img.Url,
                                        Ordem = img.Ordem
                                    }).OrderBy(x => x.Ordem).ToList() ?? new List<ProdutoImagemDTO>(),
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
                                        .ToList() ?? new List<ProdutoLojaDTO>(),
                                    Variantes = p.Variantes?.Select(v => new ProdutoVarianteDTO
                                    {
                                        Id = v.Id,
                                        SKU = v.SKU,
                                        Preco = v.Preco / 100m,
                                        Estoque = v.Estoque,
                                        Disponivel = v.Disponivel,
                                        ImagemUrl = v.ImagemUrl,
                                        Atributos = v.Atributos
                                            .Where(a => a.VarianteAtributoValor != null && a.VarianteAtributoValor.VarianteAtributo != null)
                                            .Select(a => new ProdutoVarianteAtributoDTO
                                        {
                                            ValorId = a.VarianteAtributoValorId,
                                            NomeAtributo = a.VarianteAtributoValor.VarianteAtributo.Nome,
                                            Valor = a.VarianteAtributoValor.Valor,
                                            CodigoHex = a.VarianteAtributoValor.CodigoHex
                                        }).ToList()
                                    }).ToList() ?? new List<ProdutoVarianteDTO>(),
                                    GruposOpcao = p.GruposOpcao?.OrderBy(g => g.Ordem).Select(g => new GrupoOpcaoDTO
                                    {
                                        Id = g.Id,
                                        ProdutoLojaId = g.ProdutoLojaId,
                                        Nome = g.Nome,
                                        Ordem = g.Ordem,
                                        MinSelecao = g.MinSelecao,
                                        MaxSelecao = g.MaxSelecao,
                                        Obrigatorio = g.Obrigatorio,
                                        Itens = g.Itens?.Where(i => i.Ativo).OrderBy(i => i.Ordem).Select(i => new OpcaoItemDTO
                                        {
                                            Id = i.Id,
                                            GrupoOpcaoId = i.GrupoOpcaoId,
                                            Nome = i.Nome,
                                            Preco = i.Preco,
                                            Ordem = i.Ordem,
                                            Ativo = i.Ativo
                                        }).ToList() ?? new()
                                    }).ToList() ?? new(),
                                    ModoCardapio = p.ModoCardapio
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
                            }).ToList(),
                            Etapas = cb.Etapas.OrderBy(e => e.Ordem).Select(e => new ComboEtapaDTO
                            {
                                Id = e.Id,
                                Titulo = e.Titulo,
                                Ordem = e.Ordem,
                                MinEscolhas = e.MinEscolhas,
                                MaxEscolhas = e.MaxEscolhas,
                                Obrigatorio = e.Obrigatorio,
                                Opcoes = e.Opcoes.Select(o => new ComboEtapaOpcaoDTO
                                {
                                    Id = o.Id,
                                    ProdutoLojaId = o.ProdutoLojaId,
                                    NomeProduto = o.ProdutoLoja?.Produto?.Nome ?? o.ProdutoLoja?.Descricao ?? "Opção",
                                    PrecoAdicional = o.PrecoAdicional,
                                    ImagemUrl = o.ProdutoLoja?.ImagemUrl ?? o.ProdutoLoja?.Produto?.URL_Imagem
                                }).ToList()
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
                    Segmento = l.Segmento,
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
                    BloqueadaPorFaltaDePagamento = l.BloqueadaPorFaltaDePagamento,
                    Telefone = l.Telefone,
                    WhatsApp = l.WhatsApp,
                    Logradouro = l.Logradouro,
                    Numero = l.Numero,
                    Bairro = l.Bairro,
                    Cidade = l.Cidade,
                    Estado = l.Estado,
                    Cep = l.Cep,
                    Complemento = l.Complemento
                })
                .ToListAsync();

            return lojas;
        }
    }
}
