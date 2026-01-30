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
        private readonly IProdutoLojaRepository _produtoLojaRepository; // Assuming this exists or I need to create it
        // If IProdutoLojaRepository doesn't exist, I might need to use a generic repository or add it.
        // For now I'll assume I need to create the interface and repository or use what's available.
        // Checking existing repositories... I only saw IProdutoRepository.
        // I will assume I need to create IProdutoLojaRepository as well.
        
        public ProdutoLojaService(IProdutoRepository produtoRepository, IProdutoLojaRepository produtoLojaRepository)
        {
            _produtoRepository = produtoRepository;
            _produtoLojaRepository = produtoLojaRepository;
        }

        public async Task<ProdutoLoja> AdicionarProdutoLojaAsync(CreateProdutoLojaRequest dto)
        {
            Produto produto;

            if (dto.ProdutoId.HasValue)
            {
                produto = await _produtoRepository.GetByIdAsync(dto.ProdutoId.Value);
                if (produto == null) throw new DomainException("Produto não encontrado.");
            }
            else if (dto.NovoProduto != null)
            {
                // Validate Tipo
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
                    
                    // Mapping new optional fields
                    Marca = dto.NovoProduto.Marca,
                    Modelo = dto.NovoProduto.Modelo,
                    Cor = dto.NovoProduto.Cor,
                    Tamanho = dto.NovoProduto.Tamanho,
                    Material = dto.NovoProduto.Material,
                    Fabricante = dto.NovoProduto.Fabricante,
                    URL_Video = dto.NovoProduto.URL_Video,
                    URL_Audio = dto.NovoProduto.URL_Audio,
                    URL_Documento = dto.NovoProduto.URL_Documento
                };
                await _produtoRepository.AddAsync(produto);
            }
            else
            {
                throw new DomainException("É necessário informar um ProdutoId existente ou os dados para um NovoProduto.");
            }

            // Check if already exists in store
            var existente = await _produtoLojaRepository.GetByProdutoAndLojaAsync(produto.Id, dto.LojaId);
            if (existente != null) throw new DomainException("Este produto já está vinculado a esta loja.");

            var produtoLoja = new ProdutoLoja
            {
                LojaId = dto.LojaId,
                ProdutoId = produto.Id,
                Preco = (int)dto.Preco, 
                Estoque = dto.Estoque,
                Descricao = dto.NovoProduto?.Descricao ?? produto.Descricao // Use product description as default if not provided? Or maybe dto should have specific description for store? 
                // Using product description for now as per previous logic inference or default.
                // Wait, ProdutoLoja has its own Descricao.
            };
            
            // If CreateProdutoLojaRequest doesn't have specific description for the store relation, we might want to use the product's description or empty.
            // The DTO has 'NovoProduto' which has 'Descricao'.
            // Let's assume we want to copy the product description to the store product description initially.
            produtoLoja.Descricao = produto.Descricao; 

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
                        Estoque = pl.Estoque,
                        LojaId = pl.LojaId,
                        ProdutoLojaId = pl.Id
                    });
                }
            }
            return resultado;
        }
    }
}
