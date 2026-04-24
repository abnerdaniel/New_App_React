import { useState, useEffect, useCallback } from "react";
import { api } from "../../api/axios";
import { AxiosError } from "axios";
import { cloudinaryService } from "../../services/cloudinary.service";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Search, Edit2, Trash2, X, Upload, Loader2, Tag } from "lucide-react";
import { CustomToggle } from "../../components/ui/CustomToggle";
import { CardPreview } from "../../components/CardPreview";
import { TiposProdutoModal } from "../../components/TiposProdutoModal";
import type { TipoProduto } from "../../hooks/useTiposProduto";
import { VariantesManager } from "../../components/VariantesManager";
import { GrupoOpcaoManager } from "../../components/GrupoOpcaoManager";

interface ProdutoEstoqueDTO {
  produtoId: number;
  produtoLojaId: number;
  nome: string;
  tipo: string;
  preco: number;
  estoque: number;
  imagemUrl?: string;
  isAdicional?: boolean;
  adicionaisIds?: number[];
  tipoProdutoId?: number | null;
  tipoProdutoNome?: string | null;
  modoCardapio?: string;
  categoriaId?: number;
  disponivel?: boolean;
  descricao?: string;
  adicionaisDetalhes?: { produtoFilhoId: number, quantidadeMinima: number, quantidadeMaxima: number, precoOverride: number | null }[];
  imagens?: { id: number, url: string, ordem: number }[];
}


interface CardapioDTO {
    id: number;
    nome: string;
    ativo: boolean;
}

interface CategoriaDTO {
    id: number;
    nome: string;
}

interface ProdutoCatalogoDTO {
    id: number;
    nome: string;
    tipo: string;
    imagemUrl?: string;
    lojaId?: string;
    isAdicional?: boolean;
}

interface CreateProdutoLojaPayload {
  lojaId: string;
  preco: number;
  estoque: number;
  categoriaId: number | null;
  disponivel: boolean;
  produtoId?: number;
  novoProduto?: {
    nome: string;
    descricao: string;
    tipo: string;
    imagemUrl?: string; // Legado para compatibilidade, o componente usará listagem
    isAdicional: boolean;
    adicionaisIds: number[];
  };
  adicionais?: { produtoFilhoId: number, quantidadeMinima: number, quantidadeMaxima: number, precoOverride: number | null }[];
  tipoProdutoId?: number | null;
  modoCardapio?: string;
}



// Modos de cardápio (substituem o enum interno)
const MODOS_CARDAPIO = [
  { value: 'Simples',      label: '🛒 Simples' },
  { value: 'Configuravel', label: '🧩 Personalizável' },
  { value: 'Kg',          label: '⚖️ Venda por Peso' },
];

// Componente auxiliar para busca de adicionais
function AdicionaisSearch({ catalogo, currentIds, onAdd, onCreateNew }: {
    catalogo: ProdutoCatalogoDTO[],
    currentIds: number[],
    onAdd: (id: number) => void,
    onCreateNew: (nome: string) => void
}) {
    const [term, setTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // Filtra produtos que SÃO adicionais e ainda NÃO estão vinculados
    // Verifica isAdicional (novo campo) OU se o tipo é "Adicionais" (legado)
    const suggestions = catalogo.filter(c => 
        (c.isAdicional || c.tipo === "Adicionais") && 
        !currentIds.includes(c.id) && 
        c.nome.toLowerCase().includes(term.toLowerCase())
    );

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    placeholder="Buscar ou criar adicional..." 
                    className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={term}
                    onChange={e => { setTerm(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay para clique funcionar
                />
            </div>
            
            {showDropdown && term && (
                <div className="absolute top-10 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                    {suggestions.map(s => (
                        <button
                            key={s.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex justify-between group"
                            onClick={() => { onAdd(s.id); setTerm(""); }}
                        >
                            <span>{s.nome}</span>
                            <span className="text-xs text-gray-400 group-hover:text-brand-primary">Adicionar</span>
                        </button>
                    ))}
                    
                    {suggestions.length === 0 && (
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-brand-primary/5 text-sm text-brand-primary font-bold"
                            onClick={() => { onCreateNew(term); setTerm(""); }}
                        >
                            + Criar novo: "{term}"
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function EstoquePage() {
  const { activeLoja } = useAuth();
  
  // Data State
  const [produtos, setProdutos] = useState<ProdutoEstoqueDTO[]>([]);
  const [catalogo, setCatalogo] = useState<ProdutoCatalogoDTO[]>([]); // Produtos disponíveis para cadastro
  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

  // Cardapio & Categoria State
  const [cardapios, setCardapios] = useState<CardapioDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoEstoqueDTO | null>(null);
  
  // New Product Selection State
  const [searchCatalogo, setSearchCatalogo] = useState("");
  const [selectedCatalogoItem, setSelectedCatalogoItem] = useState<ProdutoCatalogoDTO | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'detalhes' | 'variantes' | 'opcoes'>('detalhes');

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    modoCardapio: 'Simples',
    preco: "",
    estoque: "",
    imagemUrl: "",
    isAdicional: false,
    adicionaisIds: [] as number[],
    adicionais: [] as { produtoFilhoId: number, quantidadeMinima: number, quantidadeMaxima: number, precoOverride: number | null }[],
    imagens: [] as { id?: number, url: string, ordem: number }[],
    cardapioId: "",
    categoriaId: "",
    disponivel: true
  });
  const [tipoProdutoSelecionado, setTipoProdutoSelecionado] = useState<TipoProduto | null>(null);
  const [showTiposModal, setShowTiposModal] = useState(false);

  // Load data when activeLoja changes
  const loadEstoque = useCallback(async () => {
    if (!activeLoja?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/produto-loja/loja/${activeLoja.id}/estoque`);
      setProdutos(res.data);
    } catch (error) {
      console.error("Erro ao carregar estoque", error);
    } finally {
      setLoading(false);
    }
  }, [activeLoja?.id]);

  const loadCatalogo = useCallback(async () => {
      if (!activeLoja?.id) return;
      try {
          const res = await api.get(`/api/produtos?lojaId=${activeLoja.id}`);
          setCatalogo(res.data);
      } catch (error) {
          console.error("Erro ao carregar catálogo", error);
      }
  }, [activeLoja?.id]);

  const loadCardapios = useCallback(async () => {
      if (!activeLoja?.id) return;
      try {
          const res = await api.get(`/api/cardapios/loja/${activeLoja.id}`);
          setCardapios(res.data);
      } catch (error) {
          console.error("Erro ao carregar cardápios", error);
      }
  }, [activeLoja?.id]);

  const loadCategorias = useCallback(async (cardapioId: number) => {
      try {
          const res = await api.get(`/api/categorias/cardapio/${cardapioId}`);
          setCategorias(res.data);
      } catch (error) {
          console.error("Erro ao carregar categorias", error);
      }
  }, []);

  useEffect(() => {
    if (activeLoja?.id) {
      loadEstoque();
      loadCatalogo();
      loadCardapios();
    } else {
        setProdutos([]);
        setCatalogo([]);
        setCardapios([]);
    }
  }, [activeLoja, loadEstoque, loadCatalogo, loadCardapios]);

  // Load Categories when Cardapio changes
  useEffect(() => {
    if (formData.cardapioId) {
        loadCategorias(Number(formData.cardapioId));
    } else {
        setCategorias([]);
    }
  }, [formData.cardapioId, loadCategorias]);



  const formatCurrencyInput = (value: string) => {
      const digits = value.replace(/\D/g, "");
      const amount = Number(digits) / 100;
      return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, preco: formatCurrencyInput(e.target.value) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoja?.id) return;

    // Extrair centavos diretamente dos dígitos (Ex: "10,00" -> "1000" -> 1000)
    // Se o campo estiver vazio ou "0,00", será 0
    const precoCentavos = formData.preco ? Number(formData.preco.replace(/\D/g, "")) : 0;

    try {
      if (editingProduto) {
        // Update Logic
        await api.put(`/api/produto-loja/${editingProduto.produtoLojaId}`, {
          nome: formData.nome,
          preco: precoCentavos,
          estoque: Number(formData.estoque),
          isAdicional: formData.isAdicional,
          adicionaisIds: formData.adicionaisIds,
          adicionais: formData.adicionais.map(a => ({
            ...a,
            precoOverride: a.precoOverride != null ? Math.round(a.precoOverride) : null
          })),
          categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null,
          disponivel: formData.disponivel,
          imagemUrl: formData.imagemUrl,
          descricao: formData.descricao,
          tipoProdutoId: tipoProdutoSelecionado?.id || null,
          modoCardapio: formData.modoCardapio
        });

        // Sincronizando imagens se for edição (muito simplificado: manda ordem e cria novas)
        const imagensAtuais = formData.imagens;
        const imagensAnteriores = editingProduto.imagens || [];
        
        // 1. Remover as imagens deletadas pelo usuário
        const deletadas = imagensAnteriores.filter(imgAntiga => !imagensAtuais.some(i => i.id === imgAntiga.id));
        for (const imgDel of deletadas) {
            try { await api.delete(`/api/produto-loja/${editingProduto.produtoLojaId}/imagens/${imgDel.id}`); } catch (e) { console.error(e) }
        }

        // 2. Adicionar as novas (sem ID) resgatando do upload do cloudinary
        const novasImagens = imagensAtuais.filter(img => !img.id);
        for (let i = 0; i < novasImagens.length; i++) {
            try { 
                await api.post(`/api/produto-loja/${editingProduto.produtoLojaId}/imagens`, {
                    url: novasImagens[i].url,
                    ordem: imagensAtuais.indexOf(novasImagens[i])
                }); 
            } catch (e) { console.error(e) }
        }

        // 3. Atualizar ordem (a API que criamos aceita o envio de todas as imagens que restaram)
        const imagensOrdens = imagensAtuais.filter(img => img.id).map(img => ({ imagemId: img.id, ordem: imagensAtuais.indexOf(img) }));
        if (imagensOrdens.length > 0) {
            try {
                await api.put(`/api/produto-loja/${editingProduto.produtoLojaId}/imagens/ordem`, imagensOrdens);
            } catch (e) { console.error(e) }
        }

        alert("Produto atualizado!");
      } else {
        // Create Logic
        const payload: CreateProdutoLojaPayload = {
          lojaId: activeLoja.id,
          preco: precoCentavos,
          estoque: Number(formData.estoque),
          categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null,
          disponivel: formData.disponivel,
          tipoProdutoId: tipoProdutoSelecionado?.id || null,
          modoCardapio: formData.modoCardapio
        };

        if (selectedCatalogoItem && !isCreatingNew) {
            // Vincula existente
            payload.produtoId = selectedCatalogoItem.id;
        } else {
            // Cria novo
            payload.novoProduto = {
                nome: formData.nome,
                descricao: formData.descricao,
                tipo: tipoProdutoSelecionado?.nome || 'Produto',
                imagemUrl: formData.imagemUrl,
                isAdicional: formData.isAdicional,
                adicionaisIds: formData.adicionaisIds
            };
        }

        const res = await api.post("/api/produto-loja", payload);
        const newProdutoLojaId = res.data?.id || res.data?.produtoLojaId;

        // Upando imagens em lote (novas imagens)
        if (newProdutoLojaId && formData.imagens.length > 0) {
            for (let i = 0; i < formData.imagens.length; i++) {
                try {
                    await api.post(`/api/produto-loja/${newProdutoLojaId}/imagens`, {
                        url: formData.imagens[i].url,
                        ordem: i
                    });
                } catch (e) {
                    console.error("Erro ao fazer upload de imagem", e);
                }
            }
        }

        alert("Produto adicionado!");
      }
      
      closeModal();
      loadEstoque();
      loadEstoque();
      loadCatalogo(); // Recarregar catálogo pois pode ter novo produto
    } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        console.error(error);
        alert(error.response?.data?.message || "Erro ao salvar produto.");
    }
  };

  const handleEdit = (prod: ProdutoEstoqueDTO) => {
    setEditingProduto(prod);
    setActiveModalTab('detalhes');
    
    // Se veio com ID do TipoProduto, procura ele na lista carregada para preencher o combobox
    if (prod.tipoProdutoId && prod.tipoProdutoNome) {
      setTipoProdutoSelecionado({ id: prod.tipoProdutoId, nome: prod.tipoProdutoNome, ativo: true });
    } else {
      setTipoProdutoSelecionado(null);
    }

    setFormData({
      nome: prod.nome,
      descricao: prod.descricao || "",
      modoCardapio: prod.modoCardapio || 'Simples',
      preco: (prod.preco / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      estoque: prod.estoque.toString(),
      imagemUrl: prod.imagemUrl || "",
      isAdicional: prod.isAdicional || false,
      adicionaisIds: prod.adicionaisIds || [],
      adicionais: prod.adicionaisDetalhes?.length ? [...prod.adicionaisDetalhes] : (prod.adicionaisIds || []).map(id => ({ produtoFilhoId: id, quantidadeMinima: 1, quantidadeMaxima: 1, precoOverride: null })),
      imagens: prod.imagens || [],
      cardapioId: "",
      categoriaId: prod.categoriaId ? prod.categoriaId.toString() : "",
      disponivel: prod.disponivel !== false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("Remover este produto do estoque da loja?")) return;
      try {
          await api.delete(`/api/produto-loja/${id}`);
          loadEstoque();
      } catch (error) {
          console.error(error);
          alert("Erro ao remover produto.");
      }
  }

  const handleToggleDisponibilidade = async (prod: ProdutoEstoqueDTO) => {
      try {
          const novoStatus = !prod.disponivel;
          // Optimistic update
          setProdutos(prev => prev.map(p => p.produtoLojaId === prod.produtoLojaId ? { ...p, disponivel: novoStatus } : p));
          
          await api.put(`/api/produto-loja/${prod.produtoLojaId}`, {
              disponivel: novoStatus
          });
      } catch (error) {
          console.error(error);
          alert("Erro ao alterar disponibilidade.");
          loadEstoque(); // Revert on error
      }
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduto(null);
    setSelectedCatalogoItem(null);
    setIsCreatingNew(false);
    setSearchCatalogo("");
    setActiveModalTab('detalhes');
    setTipoProdutoSelecionado(null);
    setFormData({ nome: "", descricao: "", modoCardapio: 'Simples', preco: "", estoque: "", imagemUrl: "", isAdicional: false, adicionaisIds: [], adicionais: [], imagens: [], cardapioId: "", categoriaId: "", disponivel: true });
  };

  const handleSelectCatalogo = (item: ProdutoCatalogoDTO) => {
      setSelectedCatalogoItem(item);
      setIsCreatingNew(false);
      setSearchCatalogo(item.nome);
      // Pre-fill form (visual feedback)
      setFormData(prev => ({ 
           ...prev, 
          nome: item.nome, 
          imagemUrl: item.imagemUrl || "",
          isAdicional: item.isAdicional || false,
          adicionaisIds: [],
          adicionais: [],
          imagens: []
      }));
  }

  const filteredCatalogo = catalogo.filter(c => 
      c.nome.toLowerCase().includes(searchCatalogo.toLowerCase()) &&
      // Não mostrar produtos já no estoque da loja
      !produtos.some(p => p.produtoId === c.id)
  ).slice(0, 5); // Limit suggestions

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
          <p className="text-gray-500 mt-1">
             {activeLoja ? `Gerenciando: ${activeLoja.nome}` : 'Selecione uma loja no topo para gerenciar.'}
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            {activeLoja && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="h-11 px-6 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-hover shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Novo Produto
                </button>
            )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
            placeholder="Buscar por nome ou tipo..." 
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            value={filterTerm}
            onChange={e => setFilterTerm(e.target.value)}
        />
        {filterTerm && (
            <button onClick={() => setFilterTerm("")} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
            </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Preço</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Estoque</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Disponível</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando estoque...</td></tr>
                ) : filteredProdutos.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum produto encontrado.</td></tr>
                ) : (
                    filteredProdutos.map(prod => (
                        <tr key={prod.produtoLojaId} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-4">
                                <span className="font-medium text-gray-800">{prod.nome}</span>
                            </td>
                            <td className="p-4">
                                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                                    {prod.tipoProdutoNome || prod.tipo}
                                </span>
                            </td>
                            <td className="p-4 text-right font-mono text-gray-700">
                                {(prod.preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`font-bold ${prod.estoque < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                    {prod.estoque}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <div className="flex justify-center">
                                    <CustomToggle 
                                        active={prod.disponivel !== false} 
                                        onClick={() => handleToggleDisponibilidade(prod)} 
                                    />
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(prod)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(prod.produtoLojaId)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                        title="Remover"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* TiposProduto Modal */}
      {showTiposModal && activeLoja && (
        <TiposProdutoModal
          lojaId={activeLoja.id}
          onClose={() => setShowTiposModal(false)}
          onSelect={(tipo) => {
            setTipoProdutoSelecionado(tipo);
            setShowTiposModal(false);
          }}
        />
      )}

      {/* Produto Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
            {/* Grid: Form + Preview */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* LEFT: Form */}
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col shrink-0">
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-xl font-bold text-gray-800">
                            {editingProduto ? 'Editar Produto' : 'Adicionar Produto'}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    {(!formData.isAdicional && (editingProduto || isCreatingNew || selectedCatalogoItem)) && (
                      <div className="flex gap-4 mt-4 text-sm font-medium">
                        <button
                          type="button"
                          className={`pb-2 px-1 border-b-2 transition-colors ${activeModalTab === 'detalhes' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                          onClick={() => setActiveModalTab('detalhes')}
                        >
                          Detalhes e Adicionais
                        </button>
                        <button
                          type="button"
                          className={`pb-2 px-1 border-b-2 transition-colors ${activeModalTab === 'variantes' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                          onClick={() => setActiveModalTab('variantes')}
                        >
                          Variantes e Estoque
                        </button>
                        <button
                          type="button"
                          className={`pb-2 px-1 border-b-2 transition-colors ${activeModalTab === 'opcoes' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                          onClick={() => setActiveModalTab('opcoes')}
                        >
                          Grupos de Opção
                        </button>
                      </div>
                    )}
                </div>
                
                <div className="overflow-y-auto flex-1 p-6">
                    {activeModalTab === 'variantes' ? (
                       editingProduto && activeLoja ? (
                           <VariantesManager produtoLojaId={editingProduto.produtoLojaId} lojaId={activeLoja.id} />
                       ) : (
                           <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                               <p>Você precisa <strong>Salvar</strong> o novo produto primeiro para liberar a configuração de suas Variantes e grade de Estoque.</p>
                           </div>
                       )
                    ) : activeModalTab === 'opcoes' ? (
                       editingProduto ? (
                           <GrupoOpcaoManager produtoLojaId={editingProduto.produtoLojaId} />
                       ) : (
                           <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                               <p>Você precisa <strong>Salvar</strong> o produto primeiro para configurar os grupos de opção.</p>
                           </div>
                       )
                    ) : (
                      <>
                        {/* BUSCA DE PRODUTOS (Somente na Criação) */}
                    {!editingProduto && (
                        <div className="mb-6 space-y-2 relative">
                            <label className="text-xs font-bold text-gray-500 uppercase">Buscar Produto Existente</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    placeholder="   Comece a digitar o nome..."
                                    value={searchCatalogo}
                                    onChange={e => {
                                        setSearchCatalogo(e.target.value);
                                        setSelectedCatalogoItem(null);
                                        setIsCreatingNew(false);
                                        setFormData(prev => ({...prev, nome: e.target.value}));
                                    }}
                                />
                            </div>

                            {/* Suggestion Dropdown */}
                            {searchCatalogo && !selectedCatalogoItem && !isCreatingNew && (
                                <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                                     {filteredCatalogo.map(item => (
                                         <button 
                                            key={item.id}
                                            onClick={() => handleSelectCatalogo(item)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                                         >
                                             <span className="font-medium text-gray-700">{item.nome}</span>
                                             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{item.tipo}</span>
                                         </button>
                                     ))}
                                     <button 
                                        onClick={() => { setIsCreatingNew(true); setSelectedCatalogoItem(null); }}
                                        className="w-full text-left px-4 py-3 text-brand-primary font-bold hover:bg-brand-primary/5 flex items-center gap-2"
                                     >
                                        <Plus size={16} />
                                        Cadastrar novo produto: "{searchCatalogo}"
                                     </button>
                                </div>
                            )}

                            {selectedCatalogoItem && (
                                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex justify-between items-center text-sm border border-green-100">
                                    <span>Produto selecionado: <strong>{selectedCatalogoItem.nome}</strong></span>
                                    <button onClick={() => { setSelectedCatalogoItem(null); setSearchCatalogo(""); }} className="text-green-600 hover:text-green-800 underline">Alterar</button>
                                </div>
                            )}
                            
                            {isCreatingNew && (
                                <div className="bg-brand-primary/5 text-brand-primary p-3 rounded-lg flex justify-between items-center text-sm border border-brand-primary/10">
                                    <span>Cadastrando novo produto: <strong>{formData.nome}</strong></span>
                                    <button onClick={() => { setIsCreatingNew(false); }} className="text-brand-primary hover:underline">Voltar a buscar</button>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Se estiver editando ou criando novo, mostra campos detalhados */}
                        {(editingProduto || isCreatingNew) && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                                        <input 
                                            required
                                            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                            value={formData.nome}
                                            onChange={e => setFormData({...formData, nome: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo do Produto</label>
                                        <button
                                          type="button"
                                          onClick={() => setShowTiposModal(true)}
                                          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-left text-sm flex items-center justify-between hover:border-brand-primary/50 transition-colors bg-white"
                                        >
                                          <span className={tipoProdutoSelecionado ? 'text-gray-800' : 'text-gray-400'}>
                                            {tipoProdutoSelecionado
                                              ? <>{tipoProdutoSelecionado.icone} {tipoProdutoSelecionado.nome}</>
                                              : '+ Selecionar tipo...'}
                                          </span>
                                          <Tag size={14} className="text-gray-400" />
                                        </button>
                                        {tipoProdutoSelecionado && (
                                          <button type="button" onClick={() => setTipoProdutoSelecionado(null)} className="text-xs text-gray-400 hover:text-red-500">
                                            ✕ Remover tipo
                                          </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                    <textarea 
                                        className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                                        value={formData.descricao}
                                        onChange={e => setFormData({...formData, descricao: e.target.value})}
                                        placeholder="Descreva o produto..."
                                    />
                                </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Imagem do Produto</label>
                                        
                                        <div className="flex flex-col gap-4">
                                            {/* Previews das miniaturas */}
                                            {formData.imagens.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.imagens.sort((a,b) => a.ordem - b.ordem).map((img, idx) => (
                                                        <div key={idx} className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative group">
                                                            <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({ 
                                                                        ...prev, 
                                                                        imagens: prev.imagens.filter((_, i) => i !== idx).map((im, i) => ({...im, ordem: i}))
                                                                    }))}
                                                                    className="p-1 hover:text-red-400"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                {idx > 0 && (
                                                                    <button type="button" className="text-xs absolute left-1 bottom-1 text-gray-200 hover:text-white"
                                                                            onClick={() => {
                                                                                const newImgs = [...formData.imagens];
                                                                                [newImgs[idx-1].ordem, newImgs[idx].ordem] = [newImgs[idx].ordem, newImgs[idx-1].ordem];
                                                                                setFormData(prev => ({...prev, imagens: [...newImgs]}));
                                                                            }}>
                                                                        ←
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {idx === 0 && <span className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] px-1 rounded-bl">Capa</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Uploader (Max 6) */}
                                            {formData.imagens.length < 6 && (
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <input
                                                            type="file"
                                                            id="imageUpload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={async (e) => {
                                                                const files = e.target.files;
                                                                if (!files || files.length === 0) return;
                                                                
                                                                setUploading(true);
                                                                try {
                                                                    const newImages: { url: string, ordem: number }[] = [];
                                                                    for (let i = 0; i < files.length; i++) {
                                                                        if (formData.imagens.length + i >= 6) break;
                                                                        const url = await cloudinaryService.uploadImage(files[i]);
                                                                        newImages.push({ url, ordem: formData.imagens.length + i });
                                                                    }
                                                                    setFormData(prev => ({ ...prev, imagens: [...prev.imagens, ...newImages] }));
                                                                } catch {
                                                                    alert("Erro ao fazer upload da(s) imagem(ns).");
                                                                } finally {
                                                                    setUploading(false);
                                                                }
                                                            }}
                                                        />
                                                        <label 
                                                            htmlFor="imageUpload"
                                                            className={`inline-flex items-center justify-center w-full min-h-[60px] gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-brand-primary cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                                        >
                                                            {uploading ? <Loader2 size={24} className="animate-spin text-brand-primary" /> : <Upload size={24} className="text-gray-400" />}
                                                            {uploading ? "Enviando..." : "Arraste fotos ou clique (Máx 6)"}
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 pb-2">
                                        <label className="text-sm font-medium text-gray-700 select-none cursor-pointer" onClick={() => setFormData({...formData, disponivel: !formData.disponivel})}>
                                            Produto Disponível para venda?
                                        </label>
                                        <CustomToggle 
                                            active={formData.disponivel} 
                                            onClick={() => setFormData({...formData, disponivel: !formData.disponivel})} 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-2 mb-2">
                                        <label className="text-sm font-medium text-gray-700 select-none cursor-pointer" onClick={() => setFormData({...formData, isAdicional: !formData.isAdicional})}>
                                            Este produto é um Adicional/Extra?
                                        </label>
                                        <CustomToggle 
                                            active={formData.isAdicional} 
                                            onClick={() => setFormData({...formData, isAdicional: !formData.isAdicional})} 
                                        />
                                    </div>

                                    {/* CARDÁPIO E CATEGORIA */}
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-200 mt-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Cardápio (Opcional)</label>
                                            <select 
                                                className="w-full text-sm h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                                                value={formData.cardapioId}
                                                onChange={e => setFormData({...formData, cardapioId: e.target.value, categoriaId: ""})}
                                            >
                                                <option value="">Selecione...</option>
                                                {cardapios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                                            <select 
                                                className="w-full text-sm h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                                                value={formData.categoriaId}
                                                onChange={e => setFormData({...formData, categoriaId: e.target.value})}
                                                disabled={!formData.cardapioId}
                                            >
                                                <option value="">Selecione...</option>
                                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {/* SEÇÃO DE ADICIONAIS (Somente se NÃO for um adicional) */}
                            {!formData.isAdicional && (editingProduto || isCreatingNew) && (
                                <div className="space-y-3 pt-2 border-t border-dashed border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-700">Adicionais permitidos</h4>
                                    <p className="text-xs text-gray-500">Selecione quais extras o cliente pode adicionar a este produto.</p>
                                    
                                    {/* Lista de selecionados */}
                                    <div className="flex flex-col gap-3 mb-2">
                                        {formData.adicionais.map((adicional, index) => {
                                            const prod = catalogo.find(p => p.id === adicional.produtoFilhoId);
                                            const nome = prod ? prod.nome : `Adicional #${adicional.produtoFilhoId}`;
                                            return (
                                                <div key={adicional.produtoFilhoId} className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                      <span className="font-bold text-gray-700 flex items-center gap-2">
                                                          <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                                          {nome}
                                                      </span>
                                                      <button 
                                                          type="button" 
                                                          onClick={() => setFormData(prev => ({ 
                                                              ...prev, 
                                                              adicionais: prev.adicionais.filter(x => x.produtoFilhoId !== adicional.produtoFilhoId),
                                                              adicionaisIds: prev.adicionaisIds.filter(x => x !== adicional.produtoFilhoId)
                                                          }))}
                                                          className="text-gray-400 hover:text-red-500"
                                                      >
                                                          <Trash2 size={16} />
                                                      </button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Qtd. Mínima</label>
                                                            <input type="number" min={0} value={adicional.quantidadeMinima} 
                                                                onChange={e => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    const newAds = [...formData.adicionais];
                                                                    newAds[index].quantidadeMinima = val;
                                                                    setFormData({...formData, adicionais: newAds});
                                                                }}
                                                                className="w-full text-sm p-1.5 border border-gray-300 rounded outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Qtd. Máxima</label>
                                                            <input type="number" min={1} value={adicional.quantidadeMaxima} 
                                                                onChange={e => {
                                                                    const val = parseInt(e.target.value) || 1;
                                                                    const newAds = [...formData.adicionais];
                                                                    newAds[index].quantidadeMaxima = val;
                                                                    setFormData({...formData, adicionais: newAds});
                                                                }}
                                                                className="w-full text-sm p-1.5 border border-gray-300 rounded outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Preço Fixo (R$)</label>
                                                            <input type="number" step="0.01" 
                                                                value={adicional.precoOverride !== null ? (adicional.precoOverride / 100).toFixed(2) : ""} 
                                                                placeholder="Do item"
                                                                onChange={e => {
                                                                    const val = e.target.value ? parseFloat(e.target.value) * 100 : null;
                                                                    const newAds = [...formData.adicionais];
                                                                    newAds[index].precoOverride = val;
                                                                    setFormData({...formData, adicionais: newAds});
                                                                }}
                                                                className="w-full text-sm p-1.5 border border-gray-300 rounded outline-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {formData.adicionais.length === 0 && (
                                            <span className="text-xs text-gray-400 italic">Nenhum adicional vinculado. Use a busca abaixo para adicionar.</span>
                                        )}
                                    </div>

                                    {/* Busca para adicionar novo */}
                                    <AdicionaisSearch 
                                        catalogo={catalogo} 
                                        currentIds={formData.adicionais.map(x => x.produtoFilhoId)}
                                        onAdd={(id) => setFormData(prev => ({ 
                                            ...prev, 
                                            adicionaisIds: [...prev.adicionaisIds, id],
                                            adicionais: [...prev.adicionais, { produtoFilhoId: id, quantidadeMinima: 0, quantidadeMaxima: 1, precoOverride: null }] 
                                        }))}
                                        onCreateNew={async (nome) => {
                                            if(!window.confirm(`Deseja criar um novo adicional "${nome}"?`)) return;
                                            try {
                                                // Cria produto base tipo Adicional
                                                const res = await api.post("/api/produtos", {
                                                    nome,
                                                    tipo: "Adicionais",
                                                    isAdicional: true,
                                                    preco: 0,
                                                    lojaId: activeLoja?.id
                                                });
                                                const novoId = res.data.id;
                                                await loadCatalogo(); // Recarrega para ter os dados
                                                setFormData(prev => ({ ...prev, adicionaisIds: [...prev.adicionaisIds, novoId] }));
                                            } catch (err) {
                                                console.error(err);
                                                alert("Erro ao criar adicional rápido.");
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        
                        {/* Se vinculando existente, mostra resumo */}
                        {selectedCatalogoItem && !isCreatingNew && !editingProduto && (
                             <div className="text-center py-4 text-gray-500 text-sm">
                                 Defina o preço e estoque para adicionar <strong>{selectedCatalogoItem.nome}</strong> à sua loja.
                             </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Preço (R$)</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-yellow-50 font-bold text-gray-800"
                                    value={formData.preco}
                                    onChange={handlePriceChange}
                                    placeholder="0,00"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Qtd. Estoque</label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-blue-50 font-bold text-gray-800"
                                    value={formData.estoque}
                                    onChange={e => setFormData({...formData, estoque: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Modo cardápio */}
                        <div className="space-y-1 pt-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Modo de Exibição</label>
                            <div className="flex gap-2">
                                {MODOS_CARDAPIO.map(m => (
                                  <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setFormData({...formData, modoCardapio: m.value})}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${formData.modoCardapio === m.value ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-primary/40'}`}
                                  >
                                    {m.label}
                                  </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={closeModal}
                                className="flex-1 h-11 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 h-11 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-hover shadow-md"
                                disabled={!editingProduto && !selectedCatalogoItem && !isCreatingNew}
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                      </>
                    )}
                </div>
              </div>{/* /LEFT form */}

              {/* RIGHT: Card Preview */}
              <div className="hidden md:flex flex-col w-72 bg-gray-50 border-l border-gray-100 p-6 shrink-0 overflow-y-auto">
                <CardPreview
                  nome={formData.nome || undefined}
                  descricao={formData.descricao || undefined}
                  preco={formData.preco ? Number(formData.preco.replace(/\D/g, '')) : undefined}
                  imagemUrl={formData.imagemUrl || undefined}
                  tipoProdutoNome={tipoProdutoSelecionado?.nome}
                  tipoProdutoIcone={tipoProdutoSelecionado?.icone}
                  modoCardapio={formData.modoCardapio}
                  disponivel={formData.disponivel}
                />
              </div>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}
