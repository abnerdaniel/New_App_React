export interface Loja {
  id: string;
  nome: string;
  descricao?: string;
  imagemUrl?: string; // URL da logo ou banner
  bannerUrl?: string;
  avaliacao?: number;
  tempoEntregaMin: number;
  tempoEntregaMax: number;
  taxaEntrega: number;
  categoria: string;
  aberto: boolean;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoriaId: string;
  lojaId: string;
  adicionais?: Produto[]; // Produtos extras
  isAdicional?: boolean;
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
}

export interface Categoria {
  id: string;
  nome: string;
  produtos: Produto[];
  combos: Combo[];
}
