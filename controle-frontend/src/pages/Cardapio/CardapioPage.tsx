import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { cloudinaryService } from '../../services/cloudinary.service';
import { Plus, Trash2, Edit2, Search, X, Check, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

// --- Interfaces ---

interface Cardapio {
  id: number;
  nome: string;
  horarioInicio: string | null;
  horarioFim: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  diasSemana: string;
  ativo: boolean;
  categorias?: Categoria[];
}

interface Categoria {
    id: number;
    nome: string;
}

interface Combo {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  imagemUrl?: string;
  itens: ComboItem[];
  etapas: ComboEtapa[];
  categoriaId?: number | null; 
}

interface ComboItem {
  id: number;
  produtoLojaId: number;
  nomeProduto?: string; 
  quantidade: number;
  produtoLoja?: {
      nome?: string;
      descricao?: string;
      produto?: { nome: string }
  };
}

interface ComboEtapa {
  id?: number;
  titulo: string;
  ordem: number;
  minEscolhas: number;
  maxEscolhas: number;
  obrigatorio: boolean;
  opcoes: ComboEtapaOpcao[];
}

interface ComboEtapaOpcao {
  id?: number;
  produtoLojaId: number;
  nomeProduto?: string;
  precoAdicional: number;
  imagemUrl?: string;
}

interface ProdutoEstoqueDTO {
  produtoLojaId: number;
  nome: string;
  preco: number;
  imagemUrl?: string;
}

// --- Page Component ---

export function CardapioPage() {
  const { activeLoja } = useAuth();
  const [activeTab, setActiveTab] = useState<'menus' | 'combos'>('menus');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Cardápio & Ofertas</h1>
        <p className="text-gray-500 mt-1">Configure seus menus e crie combos promocionais.</p>
      </div>

      {/* Custom Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('menus')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'menus' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Meus Cardápios
        </button>
        <button
          onClick={() => setActiveTab('combos')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'combos' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Combos & Ofertas
        </button>
      </div>

      {activeTab === 'menus' ? (
        <MenusTab activeLojaId={activeLoja?.id} />
      ) : (
        <CombosTab activeLojaId={activeLoja?.id} />
      )}
    </div>
  );
}

// --- Menus Tab Component (Refactored from previous CardapioPage) ---

function MenusTab({ activeLojaId }: { activeLojaId?: string }) {
  const navigate = useNavigate();
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form Fields
  const [nome, setNome] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [ativo, setAtivo] = useState(true);

  const diasOptions = [
    { label: 'Dom', value: '0' },
    { label: 'Seg', value: '1' },
    { label: 'Ter', value: '2' },
    { label: 'Qua', value: '3' },
    { label: 'Qui', value: '4' },
    { label: 'Sex', value: '5' },
    { label: 'Sáb', value: '6' },
  ];

  useEffect(() => {
    if (activeLojaId) loadCardapios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLojaId]);

  async function loadCardapios() {
    try {
      const response = await api.get(`/api/cardapios/loja/${activeLojaId}`);
      setCardapios(response.data);
    } catch (error) {
      console.error('Erro ao carregar cardápios:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleDia(value: string) {
    if (diasSemana.includes(value)) {
      setDiasSemana(diasSemana.filter(d => d !== value));
    } else {
      setDiasSemana([...diasSemana, value]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if(!activeLojaId) return;

    const payload = {
        lojaId: activeLojaId,
        nome,
        horarioInicio: horarioInicio || null,
        horarioFim: horarioFim || null,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        diasSemana: diasSemana.join(','),
        ativo
    };

    try {
        if(editingId) {
            await api.put(`/api/cardapios/${editingId}`, payload);
            alert("Cardápio atualizado!");
        } else {
            await api.post('/api/cardapios', payload);
            alert("Cardápio criado!");
        }
        
        setShowForm(false);
        loadCardapios();
        resetForm();
    } catch (error) {
        console.error("Erro ao salvar cardápio", error);
        alert("Erro ao salvar cardápio.");
    }
  }

  const handleEdit = (c: Cardapio) => {
    setEditingId(c.id);
    setNome(c.nome);
    setHorarioInicio(c.horarioInicio || '');
    setHorarioFim(c.horarioFim || '');
    setDataInicio(c.dataInicio ? c.dataInicio.split('T')[0] : '');
    setDataFim(c.dataFim ? c.dataFim.split('T')[0] : '');
    setDiasSemana(c.diasSemana ? c.diasSemana.split(',') : []);
    setAtivo(c.ativo);
    setShowForm(true);
  }

  const handleDelete = async (id: number) => {
    if(!window.confirm("Deseja excluir este cardápio?")) return;
    try {
        await api.delete(`/api/cardapios/${id}`);
        loadCardapios();
    } catch(err) {
        console.error(err);
        alert("Erro ao excluir.");
    }
  }

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setHorarioInicio(''); setHorarioFim('');
    setDataInicio(''); setDataFim('');
    setDiasSemana([]);
    setAtivo(true);
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Listagem de Cardápios</h2>
            <button 
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-secondary flex items-center gap-2"
            >
                <Plus size={18} /> Novo Cardápio
            </button>
        </div>

        {showForm && (
            <div className="mb-8 border p-6 rounded-lg bg-gray-50 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-lg">{editingId ? 'Editar Cardápio' : 'Novo Cardápio'}</h3>
                    <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Menu</label>
                        <input value={nome} onChange={e => setNome(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="Ex: Menu de Verão, Almoço Executivo..." required />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Início (Opcional)</label>
                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Fim (Opcional)</label>
                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário Início</label>
                        <input type="time" value={horarioInicio} onChange={e => setHorarioInicio(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário Fim</label>
                        <input type="time" value={horarioFim} onChange={e => setHorarioFim(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dias de Funcionamento</label>
                        <div className="flex flex-wrap gap-2">
                            {diasOptions.map(opt => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    onClick={() => toggleDia(opt.value)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${diasSemana.includes(opt.value) ? 'bg-brand-primary text-white font-bold' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-2 flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-md">Salvar Menu</button>
                    </div>
                </form>
            </div>
        )}

        {loading ? (
            <p className="text-gray-500 text-center py-8">Carregando...</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cardapios.map(c => (
                    <div key={c.id} className="border border-gray-100 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-800">{c.nome}</h3>
                            {c.ativo ? 
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">ATIVO</span> : 
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200">INATIVO</span>
                            }
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <span className="font-semibold">Horário:</span> {c.horarioInicio ? `${c.horarioInicio.substring(0,5)}h - ${c.horarioFim?.substring(0,5)}h` : '24h'}
                            </p>
                            {(c.dataInicio || c.dataFim) && (
                                <p className="flex items-center gap-2 text-blue-600 bg-blue-50 p-1 rounded -ml-1 pl-2">
                                    <span className="font-semibold">Validade:</span> 
                                    {c.dataInicio ? new Date(c.dataInicio).toLocaleDateString() : 'Hoje'} até {c.dataFim ? new Date(c.dataFim).toLocaleDateString() : 'Indeterminado'}
                                </p>
                            )}
                            <p className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-50">
                                {c.diasSemana ? 'Dias Selecionados' : 'Todos os dias da semana'}
                            </p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => navigate(`/cardapio/${c.id}/detalhes`)} className="flex-1 py-1.5 text-sm bg-brand-primary text-white rounded hover:bg-brand-hover font-medium shadow-sm">Gerenciar Itens</button>
                            <button onClick={() => handleEdit(c)} className="p-1.5 border hover:bg-gray-50 rounded text-gray-600"><Edit2 size={16}/></button>
                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}

// --- Combos Tab Component ---

function CombosTab({ activeLojaId }: { activeLojaId?: string }) {
    const [combos, setCombos] = useState<Combo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // Create Combo Form State
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [imagemUrl, setImagemUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<{product: ProdutoEstoqueDTO, qtd: number}[]>([]);
    
    // Product Selection State
    const [availableProducts, setAvailableProducts] = useState<ProdutoEstoqueDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Category Selection State
    const [cardapios, setCardapios] = useState<Cardapio[]>([]);
    const [selectedCardapioId, setSelectedCardapioId] = useState<string>('');
    const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>('');
    const [editingComboId, setEditingComboId] = useState<number | null>(null);
    const [etapas, setEtapas] = useState<ComboEtapa[]>([]);

  useEffect(() => {
        if(activeLojaId) {
            loadCombos();
            loadProducts();
            loadCardapios();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLojaId]);

    async function loadCardapios() {
        try {
            const res = await api.get(`/api/cardapios/loja/${activeLojaId}`);
            setCardapios(res.data);
            if(res.data.length > 0) {
                 setSelectedCardapioId(res.data[0].id.toString());
            }
        } catch(err) {
            console.error(err);
        }
    }

    async function loadCombos() {
        setLoading(true);
        try {
            const res = await api.get(`/api/combos/loja/${activeLojaId}`);
            setCombos(res.data);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadProducts() {
        try {
            const res = await api.get(`/api/produto-loja/loja/${activeLojaId}/estoque`);
            setAvailableProducts(res.data);
        } catch(err) {
            console.error("Erro ao carregar produtos para combo", err);
        }
    }

    function addProductToCombo(product: ProdutoEstoqueDTO) {
        // Check if already added
        if(selectedProducts.some(p => p.product.produtoLojaId === product.produtoLojaId)) {
            // Increment
            setSelectedProducts(prev => prev.map(p => 
                p.product.produtoLojaId === product.produtoLojaId ? {...p, qtd: p.qtd + 1} : p
            ));
        } else {
            setSelectedProducts(prev => [...prev, { product, qtd: 1 }]);
        }
        setSearchTerm(''); // Clear search
    }

    function removeProductFromCombo(id: number) {
        setSelectedProducts(prev => prev.filter(p => p.product.produtoLojaId !== id));
    }

    function updateQuantity(id: number, delta: number) {
        setSelectedProducts(prev => prev.map(p => {
            if (p.product.produtoLojaId === id) {
                const newQtd = Math.max(1, p.qtd + delta);
                return { ...p, qtd: newQtd };
            }
            return p;
        }));
    }

    async function handleSaveCombo(e: React.FormEvent) {
        e.preventDefault();
        if(!activeLojaId) return;

        const precoCentavos = preco ? Number(preco.replace(/\D/g, "")) : 0;

        const payload = {
            lojaId: activeLojaId,
            nome,
            descricao,
            preco: precoCentavos,
            imagemUrl,
            ativo: true,
            categoriaId: selectedCategoriaId ? Number(selectedCategoriaId) : null,
            itens: selectedProducts.map(p => ({
                produtoLojaId: p.product.produtoLojaId,
                quantidade: p.qtd
            })),
            etapas: etapas.map(e => ({
                titulo: e.titulo,
                ordem: e.ordem,
                minEscolhas: e.minEscolhas,
                maxEscolhas: e.maxEscolhas,
                obrigatorio: e.obrigatorio,
                opcoes: e.opcoes.map(o => ({
                    produtoLojaId: o.produtoLojaId,
                    precoAdicional: o.precoAdicional
                }))
            }))
        };

        if (!selectedCategoriaId && !editingComboId) { // Only force on creation? Or update too? Let's check update logic.
             // If we are editing, current code requires reselection if we don't fetch existing CategoriaId.
             // Improved: handleEditCombo already sets state? No, backend didn't return CategoryId in List.
             // I'll make it optional warning or fix controller. 
             // FIX: Let's assume user must re-select for now or it's required.
             // if(!selectedCategoriaId) {
             //     alert("Por favor, selecione uma Categoria para o Combo.");
             //     return;
             // }
        }

        try {
            if(editingComboId) {
                await api.put(`/api/combos/${editingComboId}`, payload);
                alert("Combo atualizado!");
            } else {
                await api.post('/api/combos', payload);
                alert("Combo criado!");
            }
            
            setIsCreating(false);
            loadCombos();
            resetComboForm();
        } catch (error) {
            console.error("Erro ao salvar combo", error);
            alert("Erro ao salvar combo.");
        }
    }

    const resetComboForm = () => {
        setEditingComboId(null);
        setNome(''); setDescricao(''); setPreco(''); setImagemUrl(''); 
        setSelectedProducts([]);
        setEtapas([]);
        setSelectedCardapioId(''); setSelectedCategoriaId('');
    }

    const handleEditCombo = (c: Combo) => {
        setEditingComboId(c.id);
        setNome(c.nome);
        setDescricao(c.descricao);
        setPreco((c.preco / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        setImagemUrl(c.imagemUrl || '');
        
        // Populate Items
        const mappedItems = c.itens.map(i => {
           const prod = availableProducts.find(p => p.produtoLojaId === i.produtoLojaId) || {
               produtoLojaId: i.produtoLojaId,
               nome: i.nomeProduto,
               preco: 0 
           } as ProdutoEstoqueDTO;

           return { product: prod, qtd: i.quantidade };
        });
        setSelectedProducts(mappedItems);
        
        // Try to set category if available (it might not be if we don't have it on c)
        if(c.categoriaId) {
            setSelectedCategoriaId(c.categoriaId.toString());
            // We would also need to find which Cardapio has this category to set selectedCardapioId
            // This is complex without reverse lookup or flattening.
            // For now, user re-selects if they want to change or keep valid.
            const cardapioFound = cardapios.find(menu => menu.categorias?.some(cat => cat.id === c.categoriaId));
            if(cardapioFound) setSelectedCardapioId(cardapioFound.id.toString());
        }

        setEtapas(c.etapas || []);
        setIsCreating(true);
    }

    const handleDeleteCombo = async (id: number) => {
        if(!window.confirm("Excluir este combo?")) return;
        try {
             await api.delete(`/api/combos/${id}`);
             loadCombos();
        } catch(err) {
             console.error(err);
             alert("Erro ao excluir combo.");
        }
    }

    // Calcula preço sugerido (soma dos itens)
    const precoSugerido = selectedProducts.reduce((acc, curr) => acc + (curr.product.preco * curr.qtd), 0);

    const filteredProducts = availableProducts.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Promoções e Ofertas (Combos)</h2>
                <button 
                    onClick={() => { resetComboForm(); setIsCreating(true); }}
                    className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-secondary flex items-center gap-2"
                >
                    <Plus size={18} /> Novo Combo
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 border p-6 rounded-lg bg-yellow-50/50 border-yellow-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-800">{editingComboId ? 'Editar Oferta' : 'Criar Nova Oferta'}</h3>
                        <button onClick={() => setIsCreating(false)}><X size={20} className="text-gray-400" /></button>
                    </div>

                    <form onSubmit={handleSaveCombo}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nome da Oferta</label>
                                    <input value={nome} onChange={e => setNome(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none" required placeholder="Ex: Combo Família, Promoção de Sexta..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                    <textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none h-20 resize-none" placeholder="Descrição visível para o cliente..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Preço Final (R$)</label>
                                    <input 
                                        value={preco} 
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g,"");
                                            const n = Number(v) / 100;
                                            setPreco(n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                                        }}
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-lg text-green-700" 
                                        required 
                                        placeholder="0,00" 
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        Valor original dos itens: <strong>{(precoSugerido / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Imagem da Oferta (Opcional)</label>
                                    <div className="mt-1 flex items-center gap-4">
                                        <div className="h-20 w-20 shrink-0 bg-gray-100 rounded flex items-center justify-center border border-gray-200 overflow-hidden relative group">
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                                    <Loader2 size={20} className="text-brand-primary animate-spin" />
                                                </div>
                                            )}
                                            {imagemUrl ? (
                                                <>
                                                    <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                                                        onClick={() => setImagemUrl("")}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon size={24} className="text-gray-300" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                id="comboImageUpload"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setUploading(true);
                                                        try {
                                                            const url = await cloudinaryService.uploadImage(file);
                                                            setImagemUrl(url);
                                                        } catch {
                                                            alert("Erro ao fazer upload da imagem.");
                                                        } finally {
                                                            setUploading(false);
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <label 
                                                htmlFor="comboImageUpload"
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <Upload size={16} />
                                                {uploading ? "Enviando..." : "Carregar Foto"}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Vincular ao Menu/Categoria</label>
                                    <div className="flex gap-2">
                                        <select 
                                            value={selectedCardapioId} 
                                            onChange={e => {
                                                setSelectedCardapioId(e.target.value);
                                                setSelectedCategoriaId(''); // Reset category
                                            }}
                                            className="w-1/2 border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm"
                                        >
                                            <option value="">Selecione o Menu</option>
                                            {cardapios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                        </select>
                                        <select 
                                            value={selectedCategoriaId} 
                                            onChange={e => setSelectedCategoriaId(e.target.value)}
                                            className="w-1/2 border p-2 rounded focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm"
                                            disabled={!selectedCardapioId}
                                        >
                                            <option value="">Selecione a Categoria</option>
                                            {cardapios.find(c => c.id.toString() === selectedCardapioId)?.categorias?.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-400">Obrigatório para aparecer na vitrine.</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Itens do Combo</label>
                                
                                {/* Product Search */}
                                <div className="relative mb-4">
                                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        className="w-full pl-9 pr-3 py-2 border rounded focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        placeholder="Buscar produto para adicionar..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    
                                    {searchTerm && (
                                        <div className="absolute top-11 left-0 w-full bg-white border shadow-lg rounded z-10 max-h-48 overflow-y-auto">
                                            {filteredProducts.map(p => (
                                                <button
                                                    key={p.produtoLojaId}
                                                    type="button"
                                                    onClick={() => addProductToCombo(p)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b flex justify-between items-center"
                                                >
                                                    <span className="font-medium text-sm">{p.nome}</span>
                                                    <span className="text-xs text-gray-500">{(p.preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                </button>
                                            ))}
                                            {filteredProducts.length === 0 && <div className="p-3 text-xs text-gray-500">Nenhum produto encontrado.</div>}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Items List */}
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {selectedProducts.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded bg-gray-50">
                                            Nenhum item adicionado ao combo.
                                        </div>
                                    ) : (
                                        selectedProducts.map((item) => (
                                            <div key={item.product.produtoLojaId} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                                 <div className="flex-1">
                                                     <div className="font-semibold text-sm">{item.product.nome}</div>
                                                     <div className="text-xs text-gray-500">{(item.product.preco/100).toLocaleString('pt-BR', {style:'currency',currency:'BRL'})} un.</div>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <button type="button" onClick={() => updateQuantity(item.product.produtoLojaId, -1)} className="w-6 h-6 bg-white border rounded flex items-center justify-center hover:bg-gray-100">-</button>
                                                     <span className="text-sm font-bold w-4 text-center">{item.qtd}</span>
                                                     <button type="button" onClick={() => updateQuantity(item.product.produtoLojaId, 1)} className="w-6 h-6 bg-white border rounded flex items-center justify-center hover:bg-gray-100">+</button>
                                                     <button type="button" onClick={() => removeProductFromCombo(item.product.produtoLojaId)} className="ml-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                                 </div>
                                            </div>
                                         ))
                                    )}
                                </div>
                            </div>

                            {/* Etapas de Escolha (Novo) */}
                            <div className="col-span-1 md:col-span-2 mt-4">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Plus size={18} className="text-brand-primary" /> Etapas de Escolha (Dinamismo)
                                    </h4>
                                    <button 
                                        type="button"
                                        onClick={() => setEtapas([...etapas, { titulo: 'Nova Etapa', ordem: etapas.length, minEscolhas: 1, maxEscolhas: 1, obrigatorio: true, opcoes: [] }])}
                                        className="text-xs bg-brand-primary text-white px-3 py-1.5 rounded hover:bg-brand-hover font-bold shadow-sm transition-all"
                                    >
                                        + Adicionar Etapa
                                    </button>
                                </div>

                                {etapas.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed rounded-xl bg-gray-50 text-gray-400 text-sm">
                                        Nenhuma etapa configurada. Adicione etapas para criar um combo dinâmico (ex: Monte seu prato).
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {etapas.map((etapa, eIdx) => (
                                        <div key={eIdx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                                            <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <input 
                                                        value={etapa.titulo}
                                                        onChange={e => {
                                                            const newEtapas = [...etapas];
                                                            newEtapas[eIdx].titulo = e.target.value;
                                                            setEtapas(newEtapas);
                                                        }}
                                                        className="bg-transparent border-b border-transparent hover:border-gray-300 font-bold outline-none focus:border-brand-primary text-gray-800"
                                                        placeholder="Título da Etapa..."
                                                    />
                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                                                        <label className="flex items-center gap-1">
                                                            Min: 
                                                            <input type="number" value={etapa.minEscolhas} onChange={e => {
                                                                const newEtapas = [...etapas];
                                                                newEtapas[eIdx].minEscolhas = Number(e.target.value);
                                                                setEtapas(newEtapas);
                                                            }} className="w-10 border-b bg-transparent outline-none text-center focus:border-brand-primary" />
                                                        </label>
                                                        <label className="flex items-center gap-1">
                                                            Max:
                                                            <input type="number" value={etapa.maxEscolhas} onChange={e => {
                                                                const newEtapas = [...etapas];
                                                                newEtapas[eIdx].maxEscolhas = Number(e.target.value);
                                                                setEtapas(newEtapas);
                                                            }} className="w-10 border-b bg-transparent outline-none text-center focus:border-brand-primary" />
                                                        </label>
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="checkbox" checked={etapa.obrigatorio} onChange={e => {
                                                                const newEtapas = [...etapas];
                                                                newEtapas[eIdx].obrigatorio = e.target.checked;
                                                                setEtapas(newEtapas);
                                                            }} />
                                                            Obrigatório
                                                        </label>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEtapas(etapas.filter((_, i) => i !== eIdx))}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="p-3 flex-1 flex flex-col gap-3">
                                                {/* Adicionar Produto à Etapa */}
                                                <div className="relative group">
                                                    <select
                                                        className="w-full px-3 py-2 text-xs border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all cursor-pointer"
                                                        defaultValue=""
                                                        onChange={e => {
                                                            const term = e.target.value;
                                                            const prod = availableProducts.find(p => p.produtoLojaId === Number(term));
                                                            if (prod) {
                                                                const newEtapas = [...etapas];
                                                                if (!newEtapas[eIdx].opcoes.some(o => o.produtoLojaId === prod.produtoLojaId)) {
                                                                    newEtapas[eIdx].opcoes.push({
                                                                        produtoLojaId: prod.produtoLojaId,
                                                                        nomeProduto: prod.nome,
                                                                        precoAdicional: 0
                                                                    });
                                                                    setEtapas(newEtapas);
                                                                }
                                                            }
                                                            e.target.value = ""; // reset after add
                                                        }}
                                                    >
                                                        <option value="" disabled>Selecione um produto para adicionar...</option>
                                                        {availableProducts.map(p => (
                                                            <option key={p.produtoLojaId} value={p.produtoLojaId}>{p.nome}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2 overflow-y-auto max-h-40 pr-1 text-gray-800">
                                                    {etapa.opcoes.map((opcao, oIdx) => (
                                                        <div key={oIdx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100 group">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold">{opcao.nomeProduto}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-1 bg-white border rounded px-2 py-1">
                                                                    <span className="text-[9px] font-bold text-gray-400">+ R$</span>
                                                                    <input 
                                                                        value={(opcao.precoAdicional / 100).toFixed(2).replace('.', ',')}
                                                                        onChange={e => {
                                                                            const val = e.target.value.replace(/[^0-9]/g, "");
                                                                            const numVal = parseInt(val || "0");
                                                                            const newEtapas = [...etapas];
                                                                            newEtapas[eIdx].opcoes[oIdx].precoAdicional = numVal;
                                                                            setEtapas(newEtapas);
                                                                        }}
                                                                        className="w-12 text-[10px] font-bold text-green-600 outline-none text-right"
                                                                    />
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newEtapas = [...etapas];
                                                                        newEtapas[eIdx].opcoes = newEtapas[eIdx].opcoes.filter((_, i) => i !== oIdx);
                                                                        setEtapas(newEtapas);
                                                                    }}
                                                                    className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2 border rounded font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-bold rounded shadow hover:bg-brand-hover disabled:opacity-50" disabled={selectedProducts.length === 0 && etapas.length === 0}>{editingComboId ? 'Atualizar Oferta' : 'Criar Oferta'}</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <p className="text-center py-8 text-gray-500">Carregando ofertas...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {combos.map(combo => (
                        <div key={combo.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                            {combo.imagemUrl && <div className="h-32 bg-gray-200 w-full object-cover">
                                <img src={combo.imagemUrl} alt={combo.nome} className="w-full h-full object-cover" />
                            </div>}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{combo.nome}</h3>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">COMBO</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{combo.descricao}</p>
                                
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Itens Inclusos:</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        {combo.itens.map(item => (
                                            <li key={item.id} className="flex items-center gap-2">
                                                <Check size={12} className="text-green-500" />
                                                {item.quantidade}x {item.nomeProduto || item.produtoLoja?.nome || item.produtoLoja?.produto?.nome || 'Produto Indisponível'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                    <div className="font-bold text-2xl text-brand-primary">
                                        {(combo.preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditCombo(combo)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDeleteCombo(combo.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {combos.length === 0 && !isCreating && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            Nenhum combo ou oferta cadastrada ainda.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
