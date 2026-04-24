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
        public List<CreateComboEtapaDTO> Etapas { get; set; } = new();
    }

    public class CreateComboItemDTO
    {
        public int ProdutoLojaId { get; set; }
        public int Quantidade { get; set; }
    }

    public class CreateComboEtapaDTO
    {
        public string Titulo { get; set; } = string.Empty;
        public int Ordem { get; set; }
        public int MinEscolhas { get; set; } = 1;
        public int MaxEscolhas { get; set; } = 1;
        public bool Obrigatorio { get; set; } = true;
        public List<CreateComboEtapaOpcaoDTO> Opcoes { get; set; } = new();
    }

    public class CreateComboEtapaOpcaoDTO
    {
        public int ProdutoLojaId { get; set; }
        public int PrecoAdicional { get; set; }
    }
}
