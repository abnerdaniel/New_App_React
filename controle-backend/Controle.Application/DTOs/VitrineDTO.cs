using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class VitrineDTO
    {
        public Guid LojaId { get; set; }
        public string NomeLoja { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string? LogoUrl { get; set; }
        public string? CapaUrl { get; set; }
        public double? Avaliacao { get; set; }
        public int TempoEntregaMin { get; set; }
        public int TempoEntregaMax { get; set; }
        public decimal TaxaEntrega { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public bool Aberta { get; set; }
        public DateTime? LicencaValidaAte { get; set; }
        public bool BloqueadaPorFaltaDePagamento { get; set; }

        // Contato e Endereço
        public string? Telefone { get; set; }
        public string? WhatsApp { get; set; }
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }
        public string? Cep { get; set; }
        public string? Complemento { get; set; }

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
        public string Tipo { get; set; } = string.Empty;
        public string UrlImagem { get; set; } = string.Empty;
        public bool Esgotado { get; set; }
        public Guid LojaId { get; set; }
        public bool IsAdicional { get; set; }
        public bool Disponivel { get; set; }
        public List<ProdutoLojaDTO> Adicionais { get; set; } = new(); // Produtos correspondentes
        public List<CreateProdutoAdicionalDTO> AdicionaisDetalhes { get; set; } = new(); // Regras de adicionais
        public List<ProdutoImagemDTO> Imagens { get; set; } = new();
        public List<ProdutoVarianteDTO> Variantes { get; set; } = new();
        public List<GrupoOpcaoDTO> GruposOpcao { get; set; } = new();
        public string ModoCardapio { get; set; } = "Simples";
    }
}
