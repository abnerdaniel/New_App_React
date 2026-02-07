using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class RealizarPedidoDTO
    {
        public Guid LojaId { get; set; }
        public int ClienteId { get; set; }
        public int EnderecoEntregaId { get; set; }
        public List<ItemPedidoDTO> Itens { get; set; } = new();
    }

    public class ItemPedidoDTO
    {
        public int? IdProduto { get; set; }
        public int? IdCombo { get; set; }
        public int Qtd { get; set; }
        public List<int> AdicionaisIds { get; set; } = new(); // Lista de IDs de adicionais (ProdutoAdicional.Id ou ProdutoLoja.Id? Provavelmente ProdutoLojaId dos extras)
    }
}
