import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";

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
}

interface ProdutoCatalogoDTO {
    id: number;
    nome: string;
    tipo: string;
    imagemUrl?: string;
    lojaId?: string;
    isAdicional?: boolean;
}

interface Loja {
  id: string;
  nome: string;
}

const PRODUTO_TIPOS = [
  "Pratos", "Lanches", "Porções/Petiscos", "Bebidas", "Sobremesas", 
  "Adicionais", "Combos", "Infantil", "Especiais"
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
    const suggestions = catalogo.filter(c => 
        c.isAdicional && 
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
  const { user } = useAuth();
  
  // Data State
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<string>("");
  const [produtos, setProdutos] = useState<ProdutoEstoqueDTO[]>([]);
  const [catalogo, setCatalogo] = useState<ProdutoCatalogoDTO[]>([]); // Produtos disponíveis para cadastro
  const [loading, setLoading] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoEstoqueDTO | null>(null);
  
  // New Product Selection State
  const [searchCatalogo, setSearchCatalogo] = useState("");
  const [selectedCatalogoItem, setSelectedCatalogoItem] = useState<ProdutoCatalogoDTO | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: PRODUTO_TIPOS[0],
    preco: "",
    estoque: "",
    imagemUrl: "",
    isAdicional: false,
    adicionaisIds: [] as number[],
  });

  useEffect(() => {
    if (user) {
      api.get(`/api/loja/usuario/${user.id}`)
        .then(res => {
          setLojas(res.data);
          if (res.data.length > 0) setSelectedLojaId(res.data[0].id);
        })
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (selectedLojaId) {
      loadEstoque();
      loadCatalogo();
    }
  }, [selectedLojaId]);

  const loadEstoque = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/produto-loja/loja/${selectedLojaId}/estoque`);
      setProdutos(res.data);
    } catch (error) {
      console.error("Erro ao carregar estoque", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogo = async () => {
      try {
          // Busca produtos globais ou da loja (LojaId=null OR LojaId=Current)
          // O backend já filtra por LojaId se passado.
          const res = await api.get(`/api/produtos?lojaId=${selectedLojaId}`);
          setCatalogo(res.data);
      } catch (error) {
          console.error("Erro ao carregar catálogo", error);
      }
  }

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
    if (!selectedLojaId) return;

    // Extrair centavos diretamente dos dígitos (Ex: "10,00" -> "1000" -> 1000)
    // Se o campo estiver vazio ou "0,00", será 0
    const precoCentavos = formData.preco ? Number(formData.preco.replace(/\D/g, "")) : 0;

    try {
      if (editingProduto) {
        // Update Logic
        await api.put(`/api/produto-loja/${editingProduto.produtoLojaId}`, {
          preco: precoCentavos,
          estoque: Number(formData.estoque),
          isAdicional: formData.isAdicional,
          adicionaisIds: formData.adicionaisIds
          // descricao: formData.descricao 
        });
        alert("Produto atualizado!");
      } else {
        // Create Logic
        const payload: any = {
          lojaId: selectedLojaId,
          preco: precoCentavos,
          estoque: Number(formData.estoque)
        };

        if (selectedCatalogoItem && !isCreatingNew) {
            // Vincula existente
            payload.produtoId = selectedCatalogoItem.id;
        } else {
            // Cria novo
            payload.novoProduto = {
                nome: formData.nome,
                descricao: formData.descricao,
                tipo: formData.tipo,
                imagemUrl: formData.imagemUrl,
                isAdicional: formData.isAdicional,
                adicionaisIds: formData.adicionaisIds
            };
        }

        await api.post("/api/produto-loja", payload);
        alert("Produto adicionado!");
      }
      
      closeModal();
      loadEstoque();
      loadCatalogo(); // Recarregar catálogo pois pode ter novo produto
    } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || "Erro ao salvar produto.");
    }
  };

  const handleEdit = (prod: ProdutoEstoqueDTO) => {
    setEditingProduto(prod);
    setFormData({
      nome: prod.nome,
      descricao: "", 
      tipo: prod.tipo,
      preco: (prod.preco / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), // Formata para 0,00
      estoque: prod.estoque.toString(),
      imagemUrl: prod.imagemUrl || "",
      isAdicional: prod.isAdicional || false,
      adicionaisIds: prod.adicionaisIds || []
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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduto(null);
    setSelectedCatalogoItem(null);
    setIsCreatingNew(false);
    setSearchCatalogo("");
    setFormData({ nome: "", descricao: "", tipo: PRODUTO_TIPOS[0], preco: "", estoque: "", imagemUrl: "", isAdicional: false, adicionaisIds: [] });
  };

  const handleSelectCatalogo = (item: ProdutoCatalogoDTO) => {
      setSelectedCatalogoItem(item);
      setIsCreatingNew(false);
      setSearchCatalogo(item.nome);
      // Pre-fill form (visual feedback)
      setFormData(prev => ({ 
           ...prev, 
          nome: item.nome, 
          tipo: item.tipo || PRODUTO_TIPOS[0],
          imagemUrl: item.imagemUrl || "",
          isAdicional: item.isAdicional || false,
          adicionaisIds: [] // Reset extras when selecting from catalog
      }));
  }

  const filteredCatalogo = catalogo.filter(c => 
      c.nome.toLowerCase().includes(searchCatalogo.toLowerCase()) &&
      // Não mostrar produtos já no estoque da loja
      !produtos.some(p => p.produtoId === c.id)
  ).slice(0, 5); // Limit suggestions

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(filterTerm.toLowerCase()) || 
    p.tipo.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
          <p className="text-gray-500 mt-1">Gerencie produtos, preços e disponibilidade.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
             <div className="flex-1 md:w-64">
                <select 
                    value={selectedLojaId}
                    onChange={(e) => setSelectedLojaId(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm"
                >
                    {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-6 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-hover shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
                <Plus size={20} />
                Novo Produto
            </button>
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
                                    {prod.tipo}
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

      {/* Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">
                        {editingProduto ? 'Editar Produto' : 'Adicionar Produto'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-6">
                    {/* BUSCA DE PRODUTOS (Somente na Criação) */}
                    {!editingProduto && (
                        <div className="mb-6 space-y-2 relative">
                            <label className="text-xs font-bold text-gray-500 uppercase">Buscar Produto Existente</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    placeholder="Comece a digitar o nome..."
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
                                            disabled={!!editingProduto && !isCreatingNew}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                        <select 
                                            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                                            value={formData.tipo}
                                            onChange={e => setFormData({...formData, tipo: e.target.value})}
                                            disabled={!!editingProduto} 
                                        >
                                            {PRODUTO_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
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
                                        <label className="text-xs font-bold text-gray-500 uppercase">URL da Imagem</label>
                                        <input 
                                            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                            value={formData.imagemUrl}
                                            onChange={e => setFormData({...formData, imagemUrl: e.target.value})}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2 pt-2">
                                        <input 
                                            type="checkbox"
                                            id="isAdicional"
                                            className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
                                            checked={formData.isAdicional}
                                            onChange={e => setFormData({...formData, isAdicional: e.target.checked})}
                                        />
                                        <label htmlFor="isAdicional" className="text-sm font-medium text-gray-700 select-none">
                                            Este produto é um Adicional/Extra?
                                        </label>
                                    </div>
                                </>
                            )}
                            
                            {/* SEÇÃO DE ADICIONAIS (Somente se NÃO for um adicional) */}
                            {!formData.isAdicional && (editingProduto || isCreatingNew) && (
                                <div className="space-y-3 pt-2 border-t border-dashed border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-700">Adicionais permitidos</h4>
                                    <p className="text-xs text-gray-500">Selecione quais extras o cliente pode adicionar a este produto.</p>
                                    
                                    {/* Lista de selecionados */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.adicionaisIds.map(id => {
                                            const prod = catalogo.find(p => p.id === id); // Tenta achar no catalogo
                                            const nome = prod ? prod.nome : `Adicional #${id}`;
                                            return (
                                                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full border border-yellow-200">
                                                    {nome}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setFormData(prev => ({ ...prev, adicionaisIds: prev.adicionaisIds.filter(x => x !== id) }))}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {formData.adicionaisIds.length === 0 && (
                                            <span className="text-xs text-gray-400 italic">Nenhum adicional vinculado.</span>
                                        )}
                                    </div>

                                    {/* Busca para adicionar novo */}
                                    <AdicionaisSearch 
                                        catalogo={catalogo} 
                                        currentIds={formData.adicionaisIds}
                                        onAdd={(id) => setFormData(prev => ({ ...prev, adicionaisIds: [...prev.adicionaisIds, id] }))}
                                        onCreateNew={async (nome) => {
                                            if(!window.confirm(`Deseja criar um novo adicional "${nome}"?`)) return;
                                            try {
                                                // Cria produto base tipo Adicional
                                                const res = await api.post("/api/produtos", {
                                                    nome,
                                                    tipo: "Adicionais",
                                                    isAdicional: true,
                                                    preco: 0,
                                                    lojaId: selectedLojaId
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
                </div>
            </div>
        </div>
        )}
    </div>
  );
}
