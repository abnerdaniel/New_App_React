using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class ProdutoLoja
{
    public int Id { get; set; }
    public int LojaId { get; set; }
    public string Descricao { get; set; }//Descrição do produto
    public int Preco { get; set; }//Preço do produto
    public int Desconto { get; set; }//Desconto do produto
    public int Estoque { get; set; }//Estoque do produto
    public int Vendas { get; set; }//Vendas do produto
    public int ProdutoId { get; set; }//Produto
    public int QuantidadeEstoque { get; set; }//Quantidade do produto
}
   