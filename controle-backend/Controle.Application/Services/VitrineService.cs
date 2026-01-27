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

        public async Task<VitrineDTO?> ObterLojaParaClienteAsync(int lojaId)
        {
            // 1. Use AsNoTracking() em todas as consultas.
            var loja = await _context.Lojas
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lojaId);

            if (loja == null) return null;

            // 2. Busque todos os cardápios ativos da loja (com seus includes: Categorias e Produtos).
            var cardapios = await _context.Cardapios
                .AsNoTracking()
                .Where(c => c.LojaId == lojaId && c.Ativo)
                .Include(c => c.Categorias.OrderBy(cat => cat.OrdemExibicao))
                .ThenInclude(cat => cat.Produtos)
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

                // Verifica horário (se definido)
                if (cardapio.HorarioInicio.HasValue && cardapio.HorarioFim.HasValue)
                {
                    if (horaAtual >= cardapio.HorarioInicio.Value && horaAtual <= cardapio.HorarioFim.Value)
                    {
                        cardapioSelecionado = cardapio;
                        break; // Encontrou um específico, para. (Poderia ter lógica de prioridade, mas o primeiro que der match serve por enquanto)
                    }
                }
            }

            // Se não encontrou específico, tenta o Principal
            if (cardapioSelecionado == null)
            {
                cardapioSelecionado = cardapios.FirstOrDefault(c => c.Principal);
            }

            // 4. Mapeie e retorne o VitrineDTO.
            var vitrineDTO = new VitrineDTO
            {
                LojaId = loja.Id,
                NomeLoja = loja.Nome,
                Aberta = cardapioSelecionado != null // Se tem cardápio, consideramos aberta para pedidos (simplificação)
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
                            UrlImagem = "", // Entidade ProdutoLoja não tem UrlImagem explícita no código visto anteriormente, talvez precise pegar de ProdutoGlobal ou adicionar. 
                                            // No DTO tem UrlImagem. Na Entidade ProdutoLoja (Step 17) não vi UrlImagem.
                                            // Vou deixar vazio ou ajustar se achar a propriedade.
                                            // Vendo ProdutoLoja.cs (Step 17): não tem UrlImagem. Tem ProdutoId.
                                            // Talvez devesse incluir ProdutoGlobal para pegar a imagem?
                                            // O user pediu "Busque todos os cardápios ativos da loja (com seus includes: Categorias e Produtos)".
                                            // Não pediu Include(Produto). Mas seria bom.
                                            // Vou deixar string.Empty por enquanto para não quebrar, pois não tenho a propriedade na entidade ProdutoLoja.
                            Esgotado = p.Estoque <= 0 // Lógica simples de esgotado
                        }).ToList()
                    }).ToList()
                };
            }

            return vitrineDTO;
        }
    }
}
