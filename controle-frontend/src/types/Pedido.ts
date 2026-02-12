export interface PedidoItemAdicional {
  produtoLojaId: number;
  precoVenda: number;
}

export interface PedidoItem {
  id: number;
  pedidoId: number;
  produtoLojaId?: number;
  comboId?: number;
  nomeProduto: string; // Nome salvo no momento da venda (backup)
  quantidade: number;
  precoVenda: number;
  adicionais?: PedidoItemAdicional[];
  produtoLoja?: {
    produto?: {
      nome: string;
    }
  }
}

export interface Pedido {
  id: number;
  lojaId: string;
  numeroFila?: number;
  numeroMesa?: number;
  clienteId: number;
  cliente?: {
    id: number;
    nome: string;
  };
  descricao?: string;
  enderecoDeEntregaId?: number;
  enderecoDeEntrega?: {
    logradouro: string;
    bairro: string;
    numero: string;
    complemento?: string;
    cidade: string;
  };
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
