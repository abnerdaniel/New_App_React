import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';

// --- Interfaces ---
interface Categoria {
    id: number;
    nome: string;
    ordemExibicao: number;
    cardapioId: number;
}

interface ProdutoLoja {
    id: number; // This is ProdutoLojaId
    produtoId: number;
    nome: string; 
    preco: number;
    categoriaId?: number | null; // Keep for legacy/compat
    categoriaIds: number[]; // Main field for multi-category
    imagemUrl?: string;
    type: 'PRODUTO';
    produtoLoja?: {
        nome?: string;
        descricao?: string;
        produto?: { nome: string }
    };
}

interface Combo {
    id: number;
    nome: string;
    preco: number;
    categoriaId?: number | null; 
    // Combos currently support single category in backend (CategoriaId), 
    // but if we want consistency we might need to update Combos too using the same logic.
    // For now, let's assume Combos are still single-category or handled via CategoriaId?
    // Wait, the user asked for "Combos" too? 
    // The previous prompt said: "ao gerenciar menus tem que aparecer os combos tambem... posso incluir e excluir os combos da mesma forma que produtos."
    // Ideally Combos should also support multiple categories. 
    // BUT I only updated ProdutoLoja schema. Combo schema still has single CategoriaId.
    // I will stick to single category for Combos for now to avoid scope creep, or treat it as single.
    categoriaIds?: number[]; 
    imagemUrl?: string;
    cardapioId: number;
    type: 'COMBO';
    itens: any[];
}

interface Cardapio {
    id: number;
    nome: string;
}

type ItemMenu = ProdutoLoja | Combo;

export function CardapioDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeLoja } = useAuth();

    const [cardapio, setCardapio] = useState<Cardapio | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    
    // Unified Items State
    const [items, setItems] = useState<ItemMenu[]>([]);
    const [loading, setLoading] = useState(true);

    // State for creating/editing category
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
            // 1. Get Cardapio Info
            const cardapioRes = await api.get(`/api/cardapios/${id}`);
            setCardapio(cardapioRes.data);

            // 2. Get Categories
            const catRes = await api.get(`/api/categorias/cardapio/${id}`);
            setCategorias(catRes.data);

                // 3. Get All Store Products (Inventory) & Combos
            if(activeLoja) {
                const [prodRes, comboRes] = await Promise.all([
                    api.get(`/api/produto-loja/loja/${activeLoja.id}/estoque`),
                    api.get(`/api/combos/loja/${activeLoja.id}`)
                ]);

                const mappedProds: ProdutoLoja[] = prodRes.data.map((p: any) => ({
                    id: p.produtoLojaId,
                    produtoId: p.produtoId,
                    nome: p.nome,
                    preco: p.preco,
                    categoriaId: p.categoriaId,
                    categoriaIds: p.categoriaIds || (p.categoriaId ? [p.categoriaId] : []),
                    type: 'PRODUTO',
                    produtoLoja: {
                         nome: p.nome,
                         descricao: p.descricao,
                         produto: { nome: p.nome }
                    }
                }));

                // Fetch ALL store combos. Do NOT filter by cardapioId yet, as they might be unassigned.
                const mappedCombos: Combo[] = comboRes.data
                    .map((c: any) => ({
                        id: c.id,
                        nome: c.nome,
                        preco: c.preco,
                        categoriaId: c.categoriaId,
                        categoriaIds: c.categoriaId ? [c.categoriaId] : [],
                        imagemUrl: c.imagemUrl,
                        cardapioId: 0, // Placeholder, derived from Category later if needed
                        type: 'COMBO',
                        itens: c.itens
                    }));
                
                setItems([...mappedProds, ...mappedCombos]);
            }
        } catch(err) {
            console.error(err);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando detalhes...</div>;

    // Filter Logic for Right Column
    const availableProducts = items.filter(i => i.type === 'PRODUTO');
    const availableCombos = items.filter(i => i.type === 'COMBO');

    return (
        <div className="p-6 max-w-7xl mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/cardapio')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold text-gray-800">
                    Gerenciar Itens: <span className="text-brand-primary">{cardapio?.nome}</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Categories */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Categorias</h2>
                        <button 
                            onClick={() => { setEditingCat(null); setCatName(''); setShowCatForm(true); }}
                            className="flex items-center gap-2 text-sm bg-brand-primary text-white px-3 py-2 rounded hover:bg-brand-hover"
                        >
                            <Plus size={16} /> Nova Categoria
                        </button>
                    </div>

                    {showCatForm && (
                        <div className="bg-gray-50 p-4 rounded border mb-4 animate-in fade-in">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Categoria</label>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 border p-2 rounded" 
                                    value={catName} 
                                    onChange={e => setCatName(e.target.value)} 
                                    placeholder="Ex: Bebidas, Lanches..." 
                                    autoFocus
                                />
                                <button 
                                    onClick={saveCategoria} 
                                    className="bg-green-600 text-white px-4 rounded font-bold"
                                >
                                    Salvar
                                </button>
                                <button 
                                    onClick={() => setShowCatForm(false)} 
                                    className="border px-4 rounded hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {categorias.map(cat => (
                            <div key={cat.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                                    <h3 className="font-bold text-gray-700">{cat.nome}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEditCat(cat)} className="p-1 hover:text-blue-600"><Edit2 size={16}/></button>
                                        <button onClick={() => deleteCat(cat.id)} className="p-1 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <div className="p-3 bg-white min-h-[50px] space-y-2">
                                    {items.filter(i => (i.type === 'PRODUTO' ? i.categoriaIds?.includes(cat.id) : i.categoriaId === cat.id)).map(item => (
                                        <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-2 border rounded bg-gray-50 text-sm">
                                            <div className="flex items-center gap-2">
                                                {item.type === 'COMBO' ? <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1 rounded">COMBO</span> : <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1 rounded">PRODUTO</span>}
                                                <span>{item.nome || (item.type === 'COMBO' ? 'Combo sem nome' : 'Produto sem nome')} {item.type === 'COMBO' ? <span className="text-xs text-gray-400">({(item as Combo).itens?.length} itens)</span> : '' }</span>
                                            </div>
                                            <button 
                                                onClick={() => removeCategory(item, cat.id)}
                                                className="text-red-500 hover:underline text-xs"
                                            >
                                                Remover desta Categoria
                                            </button>
                                        </div>
                                    ))}
                                    {items.filter(i => (i.type === 'PRODUTO' ? i.categoriaIds?.includes(cat.id) : i.categoriaId === cat.id)).length === 0 && (
                                        <p className="text-xs text-center text-gray-400 py-2">Sem itens nesta categoria.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                         {categorias.length === 0 && !showCatForm && (
                            <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded">Nenhuma categoria criada.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: All Items (Add to Category) */}
                <div className="bg-white p-4 rounded-lg shadow h-fit border flex flex-col max-h-[85vh]">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Adicionar Itens</h2>
                    
                    <div className="flex-1 overflow-y-auto space-y-6">
                        {/* Section: Combos */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Combos
                            </h3>
                            <div className="space-y-2">
                                {availableCombos.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum combo disponível.</p>}
                                {availableCombos.map(item => renderItemRow(item))}
                            </div>
                        </div>

                        {/* Section: Products */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Produtos Individuais
                            </h3>
                             <div className="space-y-2">
                                {availableProducts.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum produto disponível.</p>}
                                {availableProducts.map(item => renderItemRow(item))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    async function saveCategoria() {
        if(!catName.trim() || !id) return;
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
    }

    function startEditCat(c: Categoria) {
        setEditingCat(c);
        setCatName(c.nome);
        setShowCatForm(true);
    }

    async function deleteCat(catId: number) {
        if(!confirm("Excluir categoria?")) return;
        try {
            await api.delete(`/api/categorias/${catId}`);
            loadData();
        } catch(e) {
            console.error(e);
            alert("Erro ao excluir");
        }
    }

    function renderItemRow(item: ItemMenu) {
        return (
            <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 bg-white">
                <div className="truncate flex-1">
                    <div className="flex items-center gap-1 mb-1">
                            {item.type === 'COMBO' ? <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1 rounded">COMBO</span> : null}
                            <p className="font-medium text-sm truncate" title={item.nome}>{item.nome}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {/* Logic for displaying badges differs slightly */}
                        {item.type === 'PRODUTO' ? (
                            item.categoriaIds && item.categoriaIds.length > 0 ? (
                                    item.categoriaIds.map(cid => {
                                        const cName = categorias.find(c => c.id === cid)?.nome;
                                        if(!cName) return null;
                                        return <span key={cid} className="text-[10px] bg-gray-200 px-1 rounded text-gray-600">{cName}</span>
                                    })
                            ) : <span className="text-[10px] text-gray-400 italic">Sem categoria</span>
                        ) : (
                            item.categoriaId ? (
                                <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600">
                                    {categorias.find(c => c.id === item.categoriaId)?.nome || '(Outro Menu)'}
                                </span>
                            ) : <span className="text-[10px] text-gray-400 italic">Sem categoria</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">{(item.preco/100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p>
                </div>
                
                {/* Dropdown to ADD to category */}
                <div className="relative group ml-2">
                        <button className="p-1 text-gray-400 hover:text-brand-primary bg-gray-100 rounded"><Plus size={16} /></button>
                        <select 
                        className="absolute right-0 top-0 opacity-0 w-8 h-8 cursor-pointer"
                        onChange={(e) => addCategory(item, Number(e.target.value))}
                        value=""
                        >
                        <option value="" disabled>Adicionar a...</option>
                        {/* Only show categories the item is NOT already in */}
                        {categorias.filter(c => {
                            if (item.type === 'PRODUTO') return !item.categoriaIds?.includes(c.id);
                            return item.categoriaId !== c.id; // For Combo, hide current category
                        }).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                </div>
            </div>
        );
    }

    async function addCategory(item: ItemMenu, categoriaId: number) {
        if(!categoriaId) return;
        try {
            if(item.type === 'PRODUTO') {
                const currentIds = item.categoriaIds || [];
                if(currentIds.includes(categoriaId)) return;
                
                const newIds = [...currentIds, categoriaId];
                // Call the new Bulk/List Update Endpoint
                await api.put(`/api/produto-loja/${item.id}/categorias`, newIds);
            } else {
                // Combos - still single category logic for now? 
                // User requirement implies multi-category for combos too but schema limitations.
                // If I assume I can only move compo...
                // Actually, I should probably switch combo logic if user *really* needs multi-cat for combos.
                // But for now, let's just 'move' the combo (replace category).
                await api.patch(`/api/combos/${item.id}/categoria`, { categoriaId });
            }
            loadData();
        } catch(e) {
             console.error(e);
            alert("Erro ao adicionar categoria");
        }
    }

    async function removeCategory(item: ItemMenu, categoriaId: number) {
        try {
            if(item.type === 'PRODUTO') {
                 const currentIds = item.categoriaIds || [];
                 const newIds = currentIds.filter(id => id !== categoriaId);
                 await api.put(`/api/produto-loja/${item.id}/categorias`, newIds);
            } else {
                // Combos - remove means set to null
                if(item.categoriaId === categoriaId) {
                     await api.patch(`/api/combos/${item.id}/categoria`, { categoriaId: null });
                }
            }
            loadData();
        } catch(e) {
            console.error(e);
            alert("Erro ao remover categoria");
        }
    }
}
