using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Domain.Interfaces;
using System.Linq;

namespace Controle.Application.Services
{
    public class ProdutoService : IProdutoService
    {
        private readonly IProdutoRepository _produtoRepository;

        public ProdutoService(IProdutoRepository produtoRepository)
        {
            _produtoRepository = produtoRepository;
        }

        public async Task<IEnumerable<Produto>> ObterTodosAsync()
        {
            return await _produtoRepository.GetAllAsync();
        }

        public async Task<Produto> ObterPorIdAsync(int id)
        {
            var produto = await _produtoRepository.GetByIdAsync(id);
            if (produto == null) throw new DomainException("Produto não encontrado.");
            return produto;
        }

        public async Task<IEnumerable<Produto>> ObterPorTipoAsync(string tipo)
        {
            var produtos = await _produtoRepository.GetAllAsync();
            return produtos.Where(p => p.Tipo != null && p.Tipo.ToLower().Contains(tipo.ToLower()));
        }

        public async Task<Produto> AdicionarAsync(CreateProdutoDTO dto)
        {
            var produto = new Produto
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                // Mapear outros campos conforme necessário e disponível no DTO
                // Preco e Categoria não estão na entidade Produto, mas no ProdutoLoja
                URL_Imagem = dto.ImagemUrl,
                Tipo = dto.Tipo
            };

            await _produtoRepository.AddAsync(produto);
            return produto;
        }

        public async Task<Produto> AtualizarAsync(int id, UpdateProdutoDTO dto)
        {
            var produto = await _produtoRepository.GetByIdAsync(id);
            if (produto == null) throw new DomainException("Produto não encontrado.");

            produto.Nome = dto.Nome;
            produto.Descricao = dto.Descricao;
            produto.URL_Imagem = dto.ImagemUrl;
            produto.Tipo = dto.Tipo;
            // Atualizar outros campos

            await _produtoRepository.UpdateAsync(produto);
            return produto;
        }

        public async Task RemoverAsync(int id)
        {
            var produto = await _produtoRepository.GetByIdAsync(id);
            if (produto == null) throw new DomainException("Produto não encontrado.");

            await _produtoRepository.DeleteAsync(id);
        }
    }
}
