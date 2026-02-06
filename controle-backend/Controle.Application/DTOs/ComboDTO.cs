using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class ComboDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public int Preco { get; set; }
        public string? ImagemUrl { get; set; }
        public bool Ativo { get; set; }
        public int? CategoriaId { get; set; }
        
        public List<ComboItemDTO> Itens { get; set; } = new();
    }

    public class ComboItemDTO
    {
        public int Id { get; set; }
        public int ProdutoLojaId { get; set; }
        public string NomeProduto { get; set; } = string.Empty; // Útil para exibir no front
        public int Quantidade { get; set; }
    }
}
