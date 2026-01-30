using System;
using Controle.Application.DTOs;

namespace Controle.Application.DTOs
{
    public class CreateProdutoLojaRequest
    {
        public Guid LojaId { get; set; }
        public int? ProdutoId { get; set; }
        public CreateProdutoDTO NovoProduto { get; set; }
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
    }

    public class ProdutoEstoqueDTO
    {
        public int ProdutoId { get; set; }
        public string Nome { get; set; }
        public string Tipo { get; set; }
        public string ImagemUrl { get; set; }
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
        public Guid LojaId { get; set; }
        public int ProdutoLojaId { get; set; }
    }

    public class UpdateProdutoLojaRequest
    {
        public decimal? Preco { get; set; }
        public int? Estoque { get; set; }
        public int? Desconto { get; set; }
        public string? Descricao { get; set; }
    }
}
