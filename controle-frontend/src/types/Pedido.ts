export interface PedidoItemAdicional {
  produtoLojaId: number;
  precoVenda: number;
}

export interface PedidoItem {
  id: number;
  pedidoId: number;
  produtoLojaId?: number;
  comboId?: number;
  nomeProduto: string;
  quantidade: number;
  precoVenda: number;
  adicionais?: PedidoItemAdicional[];
}

export interface Pedido {
  id: number;
  lojaId: string;
  numeroFila?: number;
  numeroMesa?: number;
  clienteId: number;
  descricao?: string;
  enderecoDeEntregaId?: number;
  dataVenda: string;
  valorTotal?: number;
  desconto?: number;
  status?: string;
  quantidade: number;
  sacola: PedidoItem[];
  metodoPagamento?: string;
  trocoPara?: number;
  observacao?: string;
  isRetirada: boolean;
  motivoCancelamento?: string;
}
