using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class CreateProdutoLojaRequest
    {
        public Guid LojaId { get; set; }
        public int? ProdutoId { get; set; }
        public CreateProdutoDTO? NovoProduto { get; set; }
        public decimal Preco { get; set; }
        public int? CategoriaId { get; set; }
        public int Estoque { get; set; }
        public bool Disponivel { get; set; } = true;
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
        public List<int> CategoriaIds { get; set; } = new();
        public bool IsAdicional { get; set; }
        public List<int> AdicionaisIds { get; set; } = new();
        public bool Disponivel { get; set; }
    }

    public class UpdateProdutoLojaRequest
    {
        public decimal? Preco { get; set; }
        public int? Estoque { get; set; }
        public int? Desconto { get; set; }
        public string? Descricao { get; set; }
        public string? ImagemUrl { get; set; }
        public int? CategoriaId { get; set; } // Legacy/Primary
        public List<int> CategoriaIds { get; set; } = new();
        public bool? IsAdicional { get; set; }
        public List<int>? AdicionaisIds { get; set; }
        public bool? Disponivel { get; set; }
    }
}
