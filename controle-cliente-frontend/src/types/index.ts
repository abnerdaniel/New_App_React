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
  // Endereço e Contato
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  complemento?: string;
  telefone?: string;
  whatsapp?: string;
  
  slug?: string;
  aceitandoPedidos?: boolean;
  licencaValidaAte?: string;
  bloqueadaPorFaltaDePagamento?: boolean;
}

export interface AdicionalDetalhe {
  produtoFilhoId: number;
  quantidadeMinima: number;
  quantidadeMaxima: number;
  precoOverride?: number;
}

export interface ProdutoImagem {
  id: number;
  url: string;
  ordem: number;
}

export interface VarianteAtributo {
  valorId: number;
  nomeAtributo: string;
  valor: string;
  codigoHex?: string;
}

export interface ProdutoVariante {
  id: number;
  sku: string;
  preco: number;
  estoque: number;
  disponivel: boolean;
  imagemUrl?: string;
  atributos: VarianteAtributo[];
}

export interface OpcaoItemCliente {
  id: number;
  grupoOpcaoId: number;
  nome: string;
  preco: number; // centavos
  ordem: number;
  ativo: boolean;
}

export interface GrupoOpcao {
  id: number;
  produtoLojaId: number;
  nome: string;
  ordem: number;
  minSelecao: number;
  maxSelecao: number;
  obrigatorio: boolean;
  itens: OpcaoItemCliente[];
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tipo?: string;
  imagemUrl?: string;
  imagens?: ProdutoImagem[];
  categoriaId: string;
  lojaId: string;
  adicionais?: Produto[]; // Produtos extras
  adicionaisDetalhes?: AdicionalDetalhe[]; // Regras dos extras
  isAdicional?: boolean;
  disponivel?: boolean;
  isCombo?: boolean;
  comboEtapas?: ComboEtapaEscolha[];
  subcategoriaId?: number;
  variantes?: ProdutoVariante[];
  produtoVarianteId?: number;
  gruposOpcao?: GrupoOpcao[];
  modoCardapio?: string; // Simples | Configuravel | Kg
}

export interface ComboItem {
  id: string;
  produtoLojaId: number;
  nomeProduto: string;
  quantidade: number;
  adicionaisDisponiveis?: Produto[];
}

export interface ComboEtapaOpcao {
  id: number;
  produtoLojaId: number;
  nomeProduto: string;
  precoAdicional: number;
}

export interface ComboEtapa {
  id: number;
  titulo: string;
  ordem: number;
  minEscolhas: number;
  maxEscolhas: number;
  obrigatorio: boolean;
  opcoes: ComboEtapaOpcao[];
}

export interface ComboEtapaEscolha {
    comboEtapaId: number;
    opcoes: { produtoLojaId: number; quantidade: number }[];
}

export interface Combo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  itens: ComboItem[];
  etapas?: ComboEtapa[];
  categoriaId?: string;
  ativo?: boolean;
}

export interface Subcategoria {
  id: number;
  nome: string;
  categoriaId: number;
}

export interface Categoria {
  id: string;
  nome: string;
  produtos: Produto[];
  combos: Combo[];
  subcategorias?: Subcategoria[];
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
