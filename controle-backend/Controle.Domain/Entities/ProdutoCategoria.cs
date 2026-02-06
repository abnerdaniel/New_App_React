using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Controle.Domain.Entities
{
    public class ProdutoCategoria
    {
        public int ProdutoLojaId { get; set; }
        public ProdutoLoja ProdutoLoja { get; set; } = null!;

        public int CategoriaId { get; set; }
        public Categoria Categoria { get; set; } = null!;
    }
}
