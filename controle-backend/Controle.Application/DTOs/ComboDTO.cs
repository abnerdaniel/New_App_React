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
        public List<ComboEtapaDTO> Etapas { get; set; } = new();
    }

    public class ComboEtapaDTO
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public int Ordem { get; set; }
        public int MinEscolhas { get; set; }
        public int MaxEscolhas { get; set; }
        public bool Obrigatorio { get; set; }
        public List<ComboEtapaOpcaoDTO> Opcoes { get; set; } = new();
    }

    public class ComboEtapaOpcaoDTO
    {
        public int Id { get; set; }
        public int ProdutoLojaId { get; set; }
        public string NomeProduto { get; set; } = string.Empty;
        public int PrecoAdicional { get; set; }
        public string? ImagemUrl { get; set; }
    }

    public class ComboItemDTO
    {
        public int Id { get; set; }
        public int ProdutoLojaId { get; set; }
        public string NomeProduto { get; set; } = string.Empty; // Útil para exibir no front
        public int Quantidade { get; set; }
        public List<ProdutoDTO> AdicionaisDisponiveis { get; set; } = new();
    }
}
