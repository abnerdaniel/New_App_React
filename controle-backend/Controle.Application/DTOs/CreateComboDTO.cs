using System;
using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class CreateComboDTO
    {
        public Guid LojaId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public int Preco { get; set; }
        public string? ImagemUrl { get; set; }
        public bool Ativo { get; set; }
        public int? CategoriaId { get; set; }

        public List<CreateComboItemDTO> Itens { get; set; } = new();
    }

    public class CreateComboItemDTO
    {
        public int ProdutoLojaId { get; set; }
        public int Quantidade { get; set; }
    }
}
