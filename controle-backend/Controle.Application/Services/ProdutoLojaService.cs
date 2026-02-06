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
                // Validar Tipo
                if (!ProdutoTipo.EhValido(dto.NovoProduto.Tipo))
                {
                     throw new DomainException($"Tipo de produto inválido. Tipos permitidos: {string.Join(", ", ProdutoTipo.Todos)}");
                }

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
                    LojaId = dto.LojaId // Vincula o produto à loja se for criado neste fluxo
                };
                
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
                Descricao = dto.NovoProduto?.Descricao ?? produto.Descricao ?? string.Empty 
                // Usar a descrição do produto como padrão se não fornecida.
                // ProdutoLoja tem sua própria descrição.
            };
            
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
            if (dto.Estoque.HasValue) produtoLoja.Estoque = dto.Estoque.Value;
            if (dto.Desconto.HasValue) produtoLoja.Desconto = dto.Desconto.Value;
            if (!string.IsNullOrEmpty(dto.Descricao)) produtoLoja.Descricao = dto.Descricao;
            if (dto.Desconto.HasValue) produtoLoja.Desconto = dto.Desconto.Value;
            if (!string.IsNullOrEmpty(dto.Descricao)) produtoLoja.Descricao = dto.Descricao;
            
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
            var resultado = new List<ProdutoEstoqueDTO>();

            foreach (var pl in produtosLoja)
            {
                var produto = await _produtoRepository.GetByIdAsync(pl.ProdutoId);
                if (produto != null)
                {
                    resultado.Add(new ProdutoEstoqueDTO
                    {
                        ProdutoId = produto.Id,
                        Nome = produto.Nome,
                        Tipo = produto.Tipo,
                        ImagemUrl = produto.URL_Imagem,
                        Preco = pl.Preco,
                        Estoque = pl.Estoque ?? 0,
                        LojaId = pl.LojaId,
                        ProdutoLojaId = pl.Id,
                        CategoriaId = pl.ProdutoCategorias.FirstOrDefault()?.CategoriaId, // Pick first as primary/legacy
                        CategoriaIds = pl.ProdutoCategorias.Select(pc => pc.CategoriaId).ToList()
                    });
                }
            }
            return resultado;
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
        }
    }
}
