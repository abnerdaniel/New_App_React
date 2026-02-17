import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit2, ArrowLeft, GripVertical } from 'lucide-react';
import { ItemSelectorModal } from '../../components/ItemSelectorModal';

// --- Interfaces ---
interface Categoria {
    id: number;
    nome: string;
    ordemExibicao: number;
    cardapioId: number;
}

interface ItemMenu {
    id: number;
    nome: string;
    preco: number;
    descricao?: string; // Add description for UI
    imagemUrl?: string; // Add image for UI
    type: 'PRODUTO' | 'COMBO';
    categoriaIds?: number[]; // For Products
    categoriaId?: number | null; // For Combos (Legacy/Current)
    disponivel?: boolean; // For Products
    ativo?: boolean; // For Combos
    // Helper for easier access
    original: any; 
}

interface Cardapio {
    id: number;
    nome: string;
}

export function CardapioDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeLoja } = useAuth();

    const [cardapio, setCardapio] = useState<Cardapio | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [allItems, setAllItems] = useState<ItemMenu[]>([]); // Setup for Modal
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'PRODUTO' | 'COMBO'>('PRODUTO');
    const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);

    // Category Form State
    const [showCatForm, setShowCatForm] = useState(false);
    const [editingCat, setEditingCat] = useState<Categoria | null>(null);
    const [catName, setCatName] = useState('');

    useEffect(() => {
        if(id && activeLoja) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, activeLoja]);

    async function loadData() {
        setLoading(true);
        try {
            const [cardapioRes, catRes, prodRes, comboRes] = await Promise.all([
                api.get(`/api/cardapios/${id}`),
                api.get(`/api/categorias/cardapio/${id}`),
                activeLoja ? api.get(`/api/produto-loja/loja/${activeLoja.id}/estoque`) : Promise.resolve({ data: [] }),
                activeLoja ? api.get(`/api/combos/loja/${activeLoja.id}`) : Promise.resolve({ data: [] })
            ]);

            setCardapio(cardapioRes.data);
            setCategorias(catRes.data);

            // Map all items for the selector
            const products: ItemMenu[] = prodRes.data.map((p: any) => ({
                id: p.produtoLojaId,
                nome: p.nome,
                preco: p.preco,
                descricao: p.descricao || p.produto?.descricao,
                imagemUrl: p.imagemUrl || p.produto?.imagemUrl, // Adjust based on actual DTO
                type: 'PRODUTO',
                categoriaIds: p.categoriaIds || (p.categoriaId ? [p.categoriaId] : []),
                disponivel: p.disponivel,
                original: p
            }));

            const combos: ItemMenu[] = comboRes.data.map((c: any) => ({
                id: c.id,
                nome: c.nome,
                preco: c.preco,
                descricao: c.descricao,
                imagemUrl: c.imagemUrl,
                type: 'COMBO',
                categoriaId: c.categoriaId,
                categoriaIds: c.categoriaId ? [c.categoriaId] : [], // Normalize
                ativo: c.ativo,
                original: c
            }));

            setAllItems([...products, ...combos]);

        } catch(err) {
            console.error(err);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;

    // Actions
    const openAddModal = (catId: number, type: 'PRODUTO' | 'COMBO') => {
        setTargetCategoryId(catId);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleAddItems = async (selectedIds: number[], type: 'PRODUTO' | 'COMBO') => {
        if (!targetCategoryId) return;

        try {
            // Process sequentially or parallel
            const promises = selectedIds.map(async (itemId) => {
                const item = allItems.find(i => i.id === itemId && i.type === type);
                if (!item) return;

                if (type === 'PRODUTO') {
                    const currentIds = item.categoriaIds || [];
                    if (!currentIds.includes(targetCategoryId)) {
                        const newIds = [...currentIds, targetCategoryId];
                        await api.put(`/api/produto-loja/${item.id}/categorias`, newIds);
                    }
                } else {
                    // Update Combo Category (Move)
                    await api.patch(`/api/combos/${item.id}/categoria`, { categoriaId: targetCategoryId });
                }
            });

            await Promise.all(promises);
            await loadData(); // Refresh to show changes
        } catch (error) {
            console.error("Erro ao adicionar itens", error);
            alert("Erro ao adicionar alguns itens.");
        }
    };

    const removeItem = async (item: ItemMenu, catId: number) => {
        if(!confirm("Remover este item da categoria?")) return;
        try {
            if (item.type === 'PRODUTO') {
                const newIds = (item.categoriaIds || []).filter(id => id !== catId);
                await api.put(`/api/produto-loja/${item.id}/categorias`, newIds);
            } else {
                await api.patch(`/api/combos/${item.id}/categoria`, { categoriaId: null });
            }
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erro ao remover item");
        }
    };

    const toggleStatus = async (item: ItemMenu) => {
        try {
            if (item.type === 'PRODUTO') {
                const newStatus = item.disponivel === false ? true : false;
                // Optimistic Update locally? Or just wait loadData. 
                // loadData is safer but slower. Let's do loadData for consistency with refactor.
                await api.put(`/api/produto-loja/${item.id}`, { disponivel: newStatus });
            } else {
                const newStatus = !item.ativo;
                await api.patch(`/api/combos/${item.id}/status`, { ativo: newStatus });
            }
            loadData(); 
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar status");
        }
    };

    // Category Actions
    const saveCategoria = async () => {
        if(!catName.trim()) return;
        try {
            if(editingCat) {
                await api.put(`/api/categorias/${editingCat.id}`, { nome: catName, ordemExibicao: editingCat.ordemExibicao });
            } else {
                await api.post(`/api/categorias`, { nome: catName, cardapioId: Number(id), ordemExibicao: categorias.length });
            }
            setShowCatForm(false);
            setCatName('');
            setEditingCat(null);
            loadData();
        } catch(e) {
            console.error(e);
            alert("Erro ao salvar categoria");
        }
    };

    const deleteCat = async (id: number) => {
        if(!confirm("Tem certeza? Isso pode remover a associação dos itens.")) return;
        try {
            await api.delete(`/api/categorias/${id}`);
            loadData();
        } catch(e) {
            console.error(e);
            alert("Erro ao excluir categoria");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/cardapio')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                            <ArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{cardapio?.nome}</h1>
                            <p className="text-xs text-gray-500">Gerenciamento de Cardápio</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setEditingCat(null); setCatName(''); setShowCatForm(true); }}
                        className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-brand-hover flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} /> Nova Categoria
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
                
                {/* Category Form */}
                {showCatForm && (
                     <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-brand-primary/20 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-gray-800 mb-4">{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                        <div className="flex gap-3">
                            <input 
                                className="flex-1 border-gray-300 border px-4 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none" 
                                value={catName} 
                                onChange={e => setCatName(e.target.value)} 
                                placeholder="Nome da Categoria (ex: Bebidas)" 
                                autoFocus
                            />
                            <button onClick={saveCategoria} className="bg-green-600 text-white px-6 rounded-lg font-bold hover:bg-green-700">Salvar</button>
                            <button onClick={() => setShowCatForm(false)} className="border px-4 rounded-lg hover:bg-gray-50 text-gray-600">Cancelar</button>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                {categorias.length === 0 && !showCatForm && (
                    <div className="text-center py-12 text-gray-400">
                        <p>Nenhuma categoria encontrada.</p>
                        <p className="text-sm">Clique em "Nova Categoria" para começar.</p>
                    </div>
                )}

                {categorias.map(cat => {
                    // Filter items for this category
                    const catItems = allItems.filter(i => 
                        i.type === 'PRODUTO' 
                            ? i.categoriaIds?.includes(cat.id) 
                            : i.categoriaId === cat.id
                    );

                    return (
                        <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Category Header */}
                            <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="text-gray-300 w-5 h-5 cursor-move" />
                                    <h2 className="font-bold text-lg text-gray-800">{cat.nome}</h2>
                                    <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {catItems.length} itens
                                    </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingCat(cat); setCatName(cat.nome); setShowCatForm(true); }} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600"><Edit2 size={16}/></button>
                                    <button onClick={() => deleteCat(cat.id)} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-red-600"><Trash2 size={16}/></button>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="divide-y divide-gray-100">
                                {catItems.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 text-sm italic">
                                        Categoria vazia. Adicione itens abaixo.
                                    </div>
                                )}
                                {catItems.map(item => {
                                    const isUnavailable = item.type === 'PRODUTO' ? item.disponivel === false : item.ativo === false;
                                    return (
                                        <div key={`${item.type}-${item.id}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Status Toggle (Switch Style) */}
                                                <button 
                                                    onClick={() => toggleStatus(item)}
                                                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${!isUnavailable ? 'bg-green-500' : 'bg-gray-300'}`}
                                                    title={isUnavailable ? "Indisponível (Clique para ativar)" : "Disponível (Clique para desativar)"}
                                                >
                                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${!isUnavailable ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                </button>

                                                <div className="flex-1 opacity-100 transition-opacity" style={{opacity: isUnavailable ? 0.5 : 1}}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-800">{item.nome}</span>
                                                        {item.type === 'COMBO' && <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 rounded">COMBO</span>}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {(item.preco/100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                                                    </p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => removeItem(item, cat.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remover da categoria"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add Item Actions */}
                            <div className="bg-gray-50/50 p-3 border-t flex justify-center gap-3">
                                <button 
                                    onClick={() => openAddModal(cat.id, 'PRODUTO')}
                                    className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Plus size={14} className="text-brand-primary" /> Adicionar Produto
                                </button>
                                <button 
                                    onClick={() => openAddModal(cat.id, 'COMBO')}
                                    className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Plus size={14} className="text-purple-600" /> Adicionar Combo
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            <ItemSelectorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddItems}
                type={modalType}
                availableItems={allItems.filter(i => i.type === modalType)}
                currentCategoryItems={
                    targetCategoryId 
                        ? allItems
                            .filter(i => i.type === 'PRODUTO' 
                                ? i.categoriaIds?.includes(targetCategoryId) 
                                : i.categoriaId === targetCategoryId
                            )
                            .map(i => i.id)
                        : []
                }
            />
        </div>
    );
}
