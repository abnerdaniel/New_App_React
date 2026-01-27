namespace Controle.Application.DTOs
{
    public class AdicionarProdutoLojaDTO
    {
        public Guid LojaId { get; set; }
        public int ProdutoGlobalId { get; set; }
        public int CategoriaId { get; set; }
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
    }
}
