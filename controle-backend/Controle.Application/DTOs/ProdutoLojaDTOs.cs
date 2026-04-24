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
        public string? ImagemUrl { get; set; }
        public int? TipoProdutoId { get; set; }
        public string? ModoCardapio { get; set; }
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
        public List<CreateProdutoAdicionalDTO> AdicionaisDetalhes { get; set; } = new(); // Detalhes de limites de adicionais
        public bool Disponivel { get; set; }
        public string? Descricao { get; set; }
        public int? TipoProdutoId { get; set; }
        public string? TipoProdutoNome { get; set; }
        public string ModoCardapio { get; set; } = "Simples";
        
        // Imagens do produto
        public List<ProdutoImagemDTO> Imagens { get; set; } = new();
    }

    public class ProdutoImagemDTO
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public int Ordem { get; set; }
    }

    public class UpdateProdutoLojaRequest
    {
        public string? Nome { get; set; }
        public decimal? Preco { get; set; }
        public int? Estoque { get; set; }
        public int? Desconto { get; set; }
        public string? Descricao { get; set; }
        public string? ImagemUrl { get; set; }
        public int? CategoriaId { get; set; } // Legacy/Primary
        public List<int> CategoriaIds { get; set; } = new();
        public bool? IsAdicional { get; set; }
        public List<int>? AdicionaisIds { get; set; }
        public List<CreateProdutoAdicionalDTO>? Adicionais { get; set; }
        public bool? Disponivel { get; set; }
        public int? TipoProdutoId { get; set; }
        public string? ModoCardapio { get; set; }
    }

    public class AddProdutoImagemDTO
    {
        public string Url { get; set; } = string.Empty;
        public int Ordem { get; set; }
    }

    public class ImagemOrdemDTO
    {
        public int ImagemId { get; set; }
        public int Ordem { get; set; }
    }
}
