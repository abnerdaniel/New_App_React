namespace Controle.Application.DTOs
{
    public class ProdutoDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }
        public string? Categoria { get; set; }
        public string? ImagemUrl { get; set; }
        public bool Ativo { get; set; }
        public string? Tipo { get; set; } // Adicionado para suportar busca por tipo
    }

    public class CreateProdutoDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }
        public string? Categoria { get; set; }
        public string? ImagemUrl { get; set; }
        public string Tipo { get; set; } = string.Empty;
        
        // Novos campos opcionais
        public string? Marca { get; set; }
        public string? Modelo { get; set; }
        public string? Cor { get; set; }
        public string? Tamanho { get; set; }
        public string? Material { get; set; }
        public string? Fabricante { get; set; }
        public string? URL_Video { get; set; }
        public string? URL_Audio { get; set; }
        public string? URL_Documento { get; set; }
        public Guid? LojaId { get; set; }
    }

    public class UpdateProdutoDTO
    {
        public string? Nome { get; set; }
        public string? Descricao { get; set; }
        public decimal? Preco { get; set; }
        public string? Categoria { get; set; }
        public string? ImagemUrl { get; set; }
        public bool? Ativo { get; set; }
        public string? Tipo { get; set; }
    }
}
