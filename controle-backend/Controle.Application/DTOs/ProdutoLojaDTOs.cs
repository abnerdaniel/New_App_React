using System;
using Controle.Application.DTOs;

namespace Controle.Application.DTOs
{
    public class CreateProdutoLojaRequest
    {
        public Guid LojaId { get; set; }
        public int? ProdutoId { get; set; }
        public CreateProdutoDTO? NovoProduto { get; set; }
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
    }

    public class ProdutoEstoqueDTO
    {
        public int ProdutoId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string? ImagemUrl { get; set; }
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
        public Guid LojaId { get; set; }
        public int ProdutoLojaId { get; set; }
        public int? CategoriaId { get; set; }
    }

    public class UpdateProdutoLojaRequest
    {
        public decimal? Preco { get; set; }
        public int? Estoque { get; set; }
        public int? Desconto { get; set; }
        public string? Descricao { get; set; }
        public int? CategoriaId { get; set; }
    }
}
