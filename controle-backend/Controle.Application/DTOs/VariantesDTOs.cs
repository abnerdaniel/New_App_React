using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    // ── Atributos ──────────────────────────────────────────────────────────────

    public class CreateVarianteAtributoRequest
    {
        public string Nome { get; set; } = string.Empty; // ex: "Tamanho"
    }

    public class AddVarianteAtributoValorRequest
    {
        public string Valor { get; set; } = string.Empty; // ex: "M"
        public string? CodigoHex { get; set; }            // ex: "#1A73E8"
    }

    public class VarianteAtributoValorDTO
    {
        public int Id { get; set; }
        public string Valor { get; set; } = string.Empty;
        public string? CodigoHex { get; set; }
    }

    public class VarianteAtributoDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public List<VarianteAtributoValorDTO> Valores { get; set; } = new();
    }

    // ── Variantes (SKUs) ───────────────────────────────────────────────────────

    public class GerarVariantesRequest
    {
        /// <summary>IDs dos VarianteAtributo a combinar</summary>
        public List<int> AtributoIds { get; set; } = new();
    }

    public class ProdutoVarianteAtributoDTO
    {
        public int ValorId { get; set; }
        public string NomeAtributo { get; set; } = string.Empty;
        public string Valor { get; set; } = string.Empty;
        public string? CodigoHex { get; set; }
    }

    public class ProdutoVarianteDTO
    {
        public int Id { get; set; }
        public string SKU { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
        public bool Disponivel { get; set; }
        public string? ImagemUrl { get; set; }
        public List<ProdutoVarianteAtributoDTO> Atributos { get; set; } = new();
    }

    public class SalvarVariantesRequest
    {
        public List<SalvarVarianteItem> Variantes { get; set; } = new();
    }

    public class SalvarVarianteItem
    {
        public int? Id { get; set; }     // null = nova; preenchido = atualiza
        public string SKU { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
        public bool Disponivel { get; set; } = true;
        public string? ImagemUrl { get; set; }
        public List<int> ValorIds { get; set; } = new(); // IDs de VarianteAtributoValor
    }

    public class AtualizarEstoqueVarianteRequest
    {
        public int Estoque { get; set; }
    }
}
