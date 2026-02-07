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
}

export interface Categoria {
  id: string;
  nome: string;
  produtos: Produto[];
}
