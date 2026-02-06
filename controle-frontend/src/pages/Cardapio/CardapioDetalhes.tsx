import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit2, ArrowLeft, MoveRight } from 'lucide-react';

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
    nome: string; // Descricao/Name from ProdutoLoja or Global
    preco: number;
    categoriaId?: number | null;
    imagemUrl?: string;
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
    const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
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

            // 3. Get All Store Products (Inventory)
            if(activeLoja) {
                const prodRes = await api.get(`/api/produto-loja/loja/${activeLoja.id}/estoque`);
                // Map to our interface
                const mappedProds = prodRes.data.map((p: any) => ({
                    id: p.produtoLojaId,
                    produtoId: p.produtoId,
                    nome: p.nome,
                    preco: p.preco,
                    categoriaId: p.categoriaId // Now available from backend
                }));
                
                setProdutos(mappedProds);
            }
        } catch(err) {
            console.error(err);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando detalhes...</div>;

    
    // ... handlers ...

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
                                    {produtos.filter(p => p.categoriaId === cat.id).map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-2 border rounded bg-gray-50 text-sm">
                                            <span>{p.nome}</span>
                                            <button 
                                                onClick={() => moveProductToCategory(p.id, 0)} // 0 = Remove from category
                                                className="text-red-500 hover:underline text-xs"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    ))}
                                    {produtos.filter(p => p.categoriaId === cat.id).length === 0 && (
                                        <p className="text-xs text-center text-gray-400 py-2">Arraste ou selecione produtos para cá</p>
                                    )}
                                </div>
                            </div>
                        ))}
                         {categorias.length === 0 && !showCatForm && (
                            <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded">Nenhuma categoria criada.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Uncategorized Products */}
                <div className="bg-white p-4 rounded-lg shadow h-fit border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Produtos da Loja</h2>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {produtos.filter(p => !p.categoriaId).map(p => (
                             <div key={p.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                                <div className="truncate flex-1">
                                    <p className="font-medium text-sm truncate" title={p.nome}>{p.nome}</p>
                                    <p className="text-xs text-gray-500">{(p.preco/100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p>
                                </div>
                                
                                {/* Dropdown to move to category */}
                                <div className="relative group">
                                     <button className="p-1 text-gray-400 hover:text-brand-primary"><MoveRight size={18} /></button>
                                     {/* This would be a popover or we use drag and drop. For MVP, maybe a select? */ }
                                     <select 
                                        className="absolute right-0 top-0 opacity-0 w-8 h-8 cursor-pointer"
                                        onChange={(e) => moveProductToCategory(p.id, Number(e.target.value))}
                                        value=""
                                     >
                                        <option value="" disabled>Mover para...</option>
                                        <option value="0">Sem Categoria</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                     </select>
                                </div>
                             </div>
                        ))}
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

    async function moveProductToCategory(produtoLojaId: number, categoriaId: number) {
        try {
            await api.put(`/api/produto-loja/${produtoLojaId}`, { 
                categoriaId: categoriaId === 0 ? null : categoriaId 
            });
            // Reload to update lists
            loadData();
        } catch(e) {
            console.error(e);
            alert("Erro ao mover produto");
        }
    }
}
