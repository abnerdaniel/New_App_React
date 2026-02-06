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
    public int ProdutoId { get; set; }
    public int QuantidadeEstoque { get; set; }
    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
    public Produto? Produto { get; set; }
    
    public ICollection<ProdutoCategoria> ProdutoCategorias { get; set; } = new List<ProdutoCategoria>();
}