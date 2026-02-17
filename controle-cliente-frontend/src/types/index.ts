export interface Loja {
  id: string;
  nome: string;
  descricao?: string;
  logoUrl?: string; // Nova URL da logo
  capaUrl?: string; // Nova URL da capa
  imagemUrl?: string; // URL da logo ou banner (Legacy)
  bannerUrl?: string;
  avaliacao?: number;
  tempoEntregaMin: number;
  tempoEntregaMax: number;
  taxaEntrega: number;
  categoria: string;
  aberto: boolean;
  // Endereço
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  complemento?: string;
  slug?: string;
  aceitandoPedidos?: boolean;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tipo?: string;
  imagemUrl?: string;
  categoriaId: string;
  lojaId: string;
  adicionais?: Produto[]; // Produtos extras
  isAdicional?: boolean;
  disponivel?: boolean;
}

export interface ComboItem {
  id: string;
  produtoLojaId: number;
  nomeProduto: string;
  quantidade: number;
  adicionaisDisponiveis?: Produto[];
}

export interface Combo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  itens: ComboItem[];
  categoriaId?: string;
  ativo?: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  produtos: Produto[];
  combos: Combo[];
}

export interface Endereco {
  id: number;
  clienteId?: number;
  lojaId?: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
  numero: string;
  referencia?: string;
  destinatario?: string;
  apelido?: string;
}
