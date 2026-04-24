using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Application.Services
{
    public class ProdutoLojaService : IProdutoLojaService
    {
        private readonly IProdutoRepository _produtoRepository;
        private readonly IProdutoLojaRepository _produtoLojaRepository; 
        
        public ProdutoLojaService(IProdutoRepository produtoRepository, IProdutoLojaRepository produtoLojaRepository)
        {
            _produtoRepository = produtoRepository;
            _produtoLojaRepository = produtoLojaRepository;
        }

        public async Task<ProdutoLoja> AdicionarProdutoLojaAsync(CreateProdutoLojaRequest dto)
        {
            Produto? produto = null;

            if (dto.ProdutoId.HasValue)
            {
                produto = await _produtoRepository.GetByIdAsync(dto.ProdutoId.Value);
            }

            // Se o produto não foi encontrado (seja porque ID não veio ou ID não existe), 
            // e temos dados para criar um novo, então criamos.
            if (produto == null && dto.NovoProduto != null)
            {
                // Tipo livre — gerenciado pelo lojista via TipoProduto

                produto = new Produto
                {
                    Nome = dto.NovoProduto.Nome,
                    Descricao = dto.NovoProduto.Descricao,
                    Tipo = dto.NovoProduto.Tipo,
                    URL_Imagem = dto.NovoProduto.ImagemUrl,
                    
                    // Mapeando novos campos opcionais
                    Marca = dto.NovoProduto.Marca ?? string.Empty,
                    Modelo = dto.NovoProduto.Modelo,
                    Cor = dto.NovoProduto.Cor,
                    Tamanho = dto.NovoProduto.Tamanho,
                    Material = dto.NovoProduto.Material,
                    Fabricante = dto.NovoProduto.Fabricante,
                    URL_Video = dto.NovoProduto.URL_Video,
                    URL_Audio = dto.NovoProduto.URL_Audio,
                    URL_Documento = dto.NovoProduto.URL_Documento,
                    LojaId = dto.LojaId, // Vincula o produto à loja se for criado neste fluxo
                    
                    IsAdicional = dto.NovoProduto.IsAdicional
                };

                if (dto.NovoProduto.Adicionais != null && dto.NovoProduto.Adicionais.Any())
                {
                    foreach (var add in dto.NovoProduto.Adicionais)
                    {
                        produto.Adicionais.Add(new ProdutoAdicional { 
                            ProdutoFilhoId = add.ProdutoFilhoId,
                            QuantidadeMinima = add.QuantidadeMinima,
                            QuantidadeMaxima = add.QuantidadeMaxima,
                            PrecoOverride = add.PrecoOverride
                        });
                    }
                }
                else if (dto.NovoProduto.AdicionaisIds != null && dto.NovoProduto.AdicionaisIds.Any())
                {
                    foreach (var idAdicional in dto.NovoProduto.AdicionaisIds)
                    {
                        produto.Adicionais.Add(new ProdutoAdicional { ProdutoFilhoId = idAdicional });
                    }
                }
                
                await _produtoRepository.AddAsync(produto);
                // O ID do produto será gerado pelo banco e populado na entidade após o AddAsync (considerando que o repo chame SaveChanges)
                // Se o repositório não chamar SaveChanges imediatamente, precisaremos chamar aqui ou garantir que o UoW trate.
                // Assumindo padrão de repositório que perdiste.
            }
            else if (produto == null)
            {
                // Se não achou por ID e não tem dados de novo produto
                throw new DomainException("Produto não encontrado e dados para novo produto não fornecidos.");
            }

            // Verificar se já existe na loja
            var existente = await _produtoLojaRepository.GetByProdutoAndLojaAsync(produto.Id, dto.LojaId);
            if (existente != null) throw new DomainException("Este produto já está vinculado a esta loja.");

            var produtoLoja = new ProdutoLoja
            {
                LojaId = dto.LojaId,
                ProdutoId = produto.Id,
                Preco = (int)dto.Preco, 
                Estoque = dto.Estoque,
                Descricao = dto.NovoProduto?.Descricao ?? produto.Descricao ?? string.Empty,
                Disponivel = dto.Disponivel,
                ImagemUrl = dto.ImagemUrl,
                TipoProdutoId = dto.TipoProdutoId.HasValue && dto.TipoProdutoId > 0 ? dto.TipoProdutoId.Value : null,
                ModoCardapio = dto.ModoCardapio ?? "Simples"
            };

            // Se CategoriaId foi informado, já cria o vínculo
            if (dto.CategoriaId.HasValue && dto.CategoriaId.Value > 0)
            {
                produtoLoja.ProdutoCategorias.Add(new ProdutoCategoria 
                { 
                    CategoriaId = dto.CategoriaId.Value 
                });
            }
            
            // Se CreateProdutoLojaRequest não tiver descrição específica para a relação com a loja, usamos a do produto.
            // O DTO tem 'NovoProduto' que tem 'Descricao'.
            // Vamos assumir que copiamos a descrição do produto para a loja inicialmente.
            produtoLoja.Descricao = produto.Descricao ?? string.Empty; 

            await _produtoLojaRepository.AddAsync(produtoLoja);
            return produtoLoja;
        }

        public async Task<ProdutoLoja> UpdateProdutoLojaAsync(int id, UpdateProdutoLojaRequest dto)
        {
            var produtoLoja = await _produtoLojaRepository.GetByIdAsync(id);
            if (produtoLoja == null) throw new DomainException("Produto da loja não encontrado.");

            if (dto.Preco.HasValue) produtoLoja.Preco = (int)dto.Preco.Value;
            if (dto.Estoque.HasValue) 
            {
                produtoLoja.Estoque = dto.Estoque.Value;
            }
            if (dto.Desconto.HasValue) produtoLoja.Desconto = dto.Desconto.Value;
            if (dto.Descricao != null) produtoLoja.Descricao = dto.Descricao;
            if (dto.Disponivel.HasValue) produtoLoja.Disponivel = dto.Disponivel.Value;

            // Atualizar Imagem na Loja
            if (dto.ImagemUrl != null)
            {
                produtoLoja.ImagemUrl = dto.ImagemUrl;
            }
            
            // Novos Campos
            if (dto.TipoProdutoId.HasValue) 
                produtoLoja.TipoProdutoId = dto.TipoProdutoId.Value > 0 ? dto.TipoProdutoId.Value : null;
            
            if (dto.ModoCardapio != null)
                produtoLoja.ModoCardapio = dto.ModoCardapio;
            
            // Legacy CategoriaId update: If provided, clear and add. 
            // Note: This overrides 'CategoriaIds' if both are present in the logic, but for now user sends specific update.
            // Ideally should deprecate CategoriaId in UpdateProdutoLojaRequest.
            if (dto.CategoriaId.HasValue) 
            {
                 produtoLoja.ProdutoCategorias.Clear();
                 if(dto.CategoriaId.Value != 0) {
                     produtoLoja.ProdutoCategorias.Add(new ProdutoCategoria { ProdutoLojaId = produtoLoja.Id, CategoriaId = dto.CategoriaId.Value });
                 }
            }
            // Multi-category update (takes precedence if populated and CategoriaId is null/ignored?)
            // Actually, let's allow CategoriaIds to add/replace.
            if (dto.CategoriaIds != null && dto.CategoriaIds.Any())
            {
                 produtoLoja.ProdutoCategorias.Clear();
                 foreach(var catId in dto.CategoriaIds)
                 {
                     produtoLoja.ProdutoCategorias.Add(new ProdutoCategoria { ProdutoLojaId = produtoLoja.Id, CategoriaId = catId });
                 }

            }

            // Atualização do Produto Pai (Nome/IsAdicional/AdicionaisIds)
            if (dto.Nome != null || dto.IsAdicional.HasValue || (dto.AdicionaisIds != null))
            {
                 var produtoPai = await _produtoRepository.GetByIdAsync(produtoLoja.ProdutoId);
                 if (produtoPai != null)
                 {
                     if (dto.Nome != null) produtoPai.Nome = dto.Nome;
                     if (dto.IsAdicional.HasValue) produtoPai.IsAdicional = dto.IsAdicional.Value;
                     
                     if (dto.Adicionais != null)
                     {
                         produtoPai.Adicionais.Clear();
                         foreach (var add in dto.Adicionais)
                         {
                             produtoPai.Adicionais.Add(new ProdutoAdicional { 
                                 ProdutoFilhoId = add.ProdutoFilhoId, 
                                 ProdutoPaiId = produtoPai.Id,
                                 QuantidadeMinima = add.QuantidadeMinima,
                                 QuantidadeMaxima = add.QuantidadeMaxima,
                                 PrecoOverride = add.PrecoOverride 
                             });
                         }
                     }
                     else if (dto.AdicionaisIds != null)
                     {
                         produtoPai.Adicionais.Clear();
                         foreach (var idAdicional in dto.AdicionaisIds)
                         {
                             produtoPai.Adicionais.Add(new ProdutoAdicional { ProdutoFilhoId = idAdicional, ProdutoPaiId = produtoPai.Id });
                         }
                     }
                     await _produtoRepository.UpdateAsync(produtoPai);
                 }
            }

            await _produtoLojaRepository.UpdateAsync(produtoLoja);
            return produtoLoja;
        }

        public async Task<bool> DeleteProdutoLojaAsync(int id)
        {
            var produtoLoja = await _produtoLojaRepository.GetByIdAsync(id);
            if (produtoLoja == null) throw new DomainException("Produto da loja não encontrado.");

            await _produtoLojaRepository.RemoveAsync(produtoLoja);
            return true;
        }

        public async Task<IEnumerable<ProdutoEstoqueDTO>> ObterEstoquePorLojaAsync(Guid lojaId)
        {
            var produtosLoja = await _produtoLojaRepository.GetByLojaIdAsync(lojaId);

            // Now mapping is purely in-memory, no extra DB calls.
            return produtosLoja.Select(pl => new ProdutoEstoqueDTO
            {
                ProdutoId = pl.ProdutoId,
                // Fallback to empty if Produto is null (though it shouldn't be with valid data)
                Nome = pl.Produto?.Nome ?? "Produto Desconhecido",
                Tipo = pl.Produto?.Tipo ?? string.Empty,
                ImagemUrl = !string.IsNullOrWhiteSpace(pl.ImagemUrl) ? pl.ImagemUrl : pl.Produto?.URL_Imagem,
                Preco = pl.Preco,
                Estoque = pl.Estoque ?? 0,
                LojaId = pl.LojaId,
                ProdutoLojaId = pl.Id,
                TipoProdutoId = pl.TipoProdutoId,
                TipoProdutoNome = pl.TipoProduto?.Nome,
                ModoCardapio = pl.ModoCardapio ?? "Simples",
                CategoriaId = pl.ProdutoCategorias.FirstOrDefault()?.CategoriaId, 
                CategoriaIds = pl.ProdutoCategorias.Select(pc => pc.CategoriaId).ToList(),
                
                // Mapeia os IDs antigos para compatibilidade, e a nova estrutura detalhada.
                IsAdicional = pl.Produto?.IsAdicional ?? false,
                AdicionaisIds = pl.Produto?.Adicionais.Select(a => a.ProdutoFilhoId).ToList() ?? new List<int>(),
                AdicionaisDetalhes = pl.Produto?.Adicionais.Select(a => new CreateProdutoAdicionalDTO
                {
                    ProdutoFilhoId = a.ProdutoFilhoId,
                    QuantidadeMinima = a.QuantidadeMinima,
                    QuantidadeMaxima = a.QuantidadeMaxima,
                    PrecoOverride = a.PrecoOverride
                }).ToList() ?? new List<CreateProdutoAdicionalDTO>(),
                
                Imagens = pl.Imagens.OrderBy(img => img.Ordem).Select(img => new ProdutoImagemDTO
                {
                    Id = img.Id,
                    Url = img.Url,
                    Ordem = img.Ordem
                }).ToList(),
                Disponivel = pl.Disponivel,
                Descricao = string.IsNullOrEmpty(pl.Descricao) ? pl.Produto?.Descricao : pl.Descricao
            }).ToList();
        }

        public async Task AtualizarCategoriasProdutoAsync(int produtoLojaId, List<int> categoriaIds)
        {
            var produtoLoja = await _produtoLojaRepository.GetByIdAsync(produtoLojaId);
            if (produtoLoja == null) throw new DomainException("Produto não encontrado.");

            // Clear existing
            produtoLoja.ProdutoCategorias.Clear();
            
            // Add new
            foreach(var catId in categoriaIds)
            {
                produtoLoja.ProdutoCategorias.Add(new ProdutoCategoria 
                { 
                    ProdutoLojaId = produtoLojaId, 
                    CategoriaId = catId 
                });
            }

            await _produtoLojaRepository.UpdateAsync(produtoLoja);
            await _produtoLojaRepository.UpdateAsync(produtoLoja);
        }


        public async Task<ProdutoImagemDTO> AdicionarImagemAsync(int produtoLojaId, AddProdutoImagemDTO dto)
        {
            var produtoLoja = await _produtoLojaRepository.GetByIdAsync(produtoLojaId);
            if (produtoLoja == null) throw new DomainException("Produto não encontrado.");

            var novaImagem = new ProdutoImagem
            {
                Url = dto.Url,
                Ordem = dto.Ordem
            };

            produtoLoja.Imagens.Add(novaImagem);
            await _produtoLojaRepository.UpdateAsync(produtoLoja);

            return new ProdutoImagemDTO
            {
                Id = novaImagem.Id,
                Url = novaImagem.Url,
                Ordem = novaImagem.Ordem
            };
        }

        public async Task RemoverImagemAsync(int produtoLojaId, int imagemId)
        {
            var produtoLoja = await _produtoLojaRepository.GetByIdAsync(produtoLojaId);
            if (produtoLoja == null) throw new DomainException("Produto não encontrado.");

            var imagem = produtoLoja.Imagens.FirstOrDefault(i => i.Id == imagemId);
            if (imagem == null) throw new DomainException("Imagem não encontrada no produto.");

            produtoLoja.Imagens.Remove(imagem);
            await _produtoLojaRepository.UpdateAsync(produtoLoja);
        }

        public async Task ReordenarImagensAsync(int produtoLojaId, List<ImagemOrdemDTO> ordens)
        {
            var produtoLoja = await _produtoLojaRepository.GetByIdAsync(produtoLojaId);
            if (produtoLoja == null) throw new DomainException("Produto não encontrado.");

            foreach (var ordem in ordens)
            {
                var imagem = produtoLoja.Imagens.FirstOrDefault(i => i.Id == ordem.ImagemId);
                if (imagem != null)
                {
                    imagem.Ordem = ordem.Ordem;
                }
            }

            await _produtoLojaRepository.UpdateAsync(produtoLoja);
        }
    }
}
