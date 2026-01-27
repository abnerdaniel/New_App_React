namespace Controle.Application.DTOs
{
    public class ProdutoRankingDTO
    {
        public string NomeProduto { get; set; } = string.Empty;
        public int QuantidadeVendida { get; set; }
        public int ValorTotalVendido { get; set; }
    }
}
