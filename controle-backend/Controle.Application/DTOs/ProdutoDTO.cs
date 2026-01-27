namespace Controle.Application.DTOs
{
    public class ProdutoDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public decimal Preco { get; set; }
        public string Categoria { get; set; }
        public string ImagemUrl { get; set; }
        public bool Ativo { get; set; }
        public string Tipo { get; set; } // Adicionado para suportar busca por tipo
    }

    public class CreateProdutoDTO
    {
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public decimal Preco { get; set; }
        public string Categoria { get; set; }
        public string ImagemUrl { get; set; }
        public string Tipo { get; set; }
    }

    public class UpdateProdutoDTO
    {
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public decimal Preco { get; set; }
        public string Categoria { get; set; }
        public string ImagemUrl { get; set; }
        public bool Ativo { get; set; }
        public string Tipo { get; set; }
    }
}
