namespace Controle.Domain.Entities
{
    public class ProdutoImagem
    {
        public int Id { get; set; }
        public int ProdutoLojaId { get; set; }
        public ProdutoLoja? ProdutoLoja { get; set; }
        
        public string Url { get; set; } = string.Empty;
        public int Ordem { get; set; } = 0;
    }
}
