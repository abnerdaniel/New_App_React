using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class ProdutoLoja
{
    public int Id { get; set; }
    public Guid LojaId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public int Preco { get; set; }
    public int? Desconto { get; set; }
    public int? Estoque { get; set; }
    public int? Vendas { get; set; }
    public bool Disponivel { get; set; } = true;
    public string? ImagemUrl { get; set; } // Store specific image override
    public int ProdutoId { get; set; }
    // [Obsolete] QuantidadeEstoque removido.
    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
    public Produto? Produto { get; set; }
    
    public ICollection<ProdutoCategoria> ProdutoCategorias { get; set; } = new List<ProdutoCategoria>();
    public ICollection<ProdutoImagem> Imagens { get; set; } = new List<ProdutoImagem>();

    public int? TipoProdutoId { get; set; }
    public TipoProduto? TipoProduto { get; set; }

    // Modo de exibição no cardápio
    public string ModoCardapio { get; set; } = "Simples"; // Simples | Configuravel | Kg
    
    // Variantes de varejo (SKU composto)
    public ICollection<ProdutoVariante> Variantes { get; set; } = new List<ProdutoVariante>();

    // Grupos de opção para produto configurável (pizza, lanche montado, etc.)
    public ICollection<GrupoOpcao> GruposOpcao { get; set; } = new List<GrupoOpcao>();
}