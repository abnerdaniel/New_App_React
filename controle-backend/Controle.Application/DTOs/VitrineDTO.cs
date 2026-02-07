using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class VitrineDTO
    {
        public Guid LojaId { get; set; }
        public string NomeLoja { get; set; } = string.Empty;
        public bool Aberta { get; set; }
        public CardapioDTO? Cardapio { get; set; }
    }

    public class CardapioDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public List<CategoriaDTO> Categorias { get; set; } = new();
    }

    public class CategoriaDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public List<ProdutoLojaDTO> Produtos { get; set; } = new();
        public List<ComboDTO> Combos { get; set; } = new();
    }

    public class ProdutoLojaDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public string UrlImagem { get; set; } = string.Empty;
        public bool Esgotado { get; set; }
        public Guid LojaId { get; set; }
        public bool IsAdicional { get; set; }
        public bool Disponivel { get; set; }
        public List<ProdutoLojaDTO> Adicionais { get; set; } = new(); // Lista de produtos extras disponíveis
    }
}
