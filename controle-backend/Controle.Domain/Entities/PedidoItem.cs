
public class PedidoItem
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProdutoLojaId { get; set; } // O produto original
    public string NomeProduto { get; set; } // Salva o nome (caso o original mude)
    public int PrecoVenda { get; set; } // O PREÇO QUE FOI PAGO (R$ 20,00)
    public int Quantidade { get; set; }
}