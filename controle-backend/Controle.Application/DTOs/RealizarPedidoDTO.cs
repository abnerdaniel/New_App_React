using System.Collections.Generic;

namespace Controle.Application.DTOs
{
    public class RealizarPedidoDTO
    {
        public string LojaId { get; set; } = string.Empty;
        public string? NomeCliente { get; set; } // Nome para identificação (Balcão/Senha)
        public int? ClienteId { get; set; }
        public int? EnderecoEntregaId { get; set; }
        public bool IsRetirada { get; set; } = false;
        public string MetodoPagamento { get; set; } = string.Empty;
        public decimal? TrocoPara { get; set; }
        public string? Observacao { get; set; }
        public bool? EnviarParaCozinha { get; set; } // New flag for PDV
        public int? FuncionarioId { get; set; } // Quem realizou o pedido (se logado)
        public int? NumeroMesa { get; set; } // Mesa (se houver)
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
