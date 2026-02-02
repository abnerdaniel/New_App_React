import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Search, Edit2, Trash2, X, RotateCcw } from "lucide-react";

interface ProdutoEstoqueDTO {
  produtoId: number;
  produtoLojaId: number;
  nome: string;
  tipo: string;
  preco: number;
  estoque: number;
  imagemUrl?: string;
}

interface Loja {
  id: string;
  nome: string;
}

const PRODUTO_TIPOS = [
  "Pratos", "Lanches", "Porções/Petiscos", "Bebidas", "Sobremesas", 
  "Adicionais", "Combos", "Infantil", "Especiais"
];

export function EstoquePage() {
  const { user } = useAuth();
  
  // Data State
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<string>("");
  const [produtos, setProdutos] = useState<ProdutoEstoqueDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoEstoqueDTO | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: PRODUTO_TIPOS[0],
    preco: "",
    estoque: "",
    imagemUrl: ""
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLojaId) return;

    try {
      if (editingProduto) {
        // Update Logic
        await api.put(`/api/produto-loja/${editingProduto.produtoLojaId}`, {
          preco: Number(formData.preco),
          estoque: Number(formData.estoque),
          // descricao: formData.descricao 
        });
        alert("Produto atualizado!");
      } else {
        // Create Logic
        const payload = {
          lojaId: selectedLojaId,
          novoProduto: {
            nome: formData.nome,
            descricao: formData.descricao,
            tipo: formData.tipo,
            imagemUrl: formData.imagemUrl
          },
          preco: Number(formData.preco),
          estoque: Number(formData.estoque)
        };
        await api.post("/api/produto-loja", payload);
        alert("Produto adicionado!");
      }
      
      closeModal();
      loadEstoque();
    } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || "Erro ao salvar produto.");
    }
  };

  const handleEdit = (prod: ProdutoEstoqueDTO) => {
    setEditingProduto(prod);
    setFormData({
      nome: prod.nome,
      descricao: "", // Descrição não vem no DTO de lista simples, precisaria buscar ou ignorar
      tipo: prod.tipo,
      preco: prod.preco.toString(),
      estoque: prod.estoque.toString(),
      imagemUrl: prod.imagemUrl || ""
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
    setFormData({ nome: "", descricao: "", tipo: PRODUTO_TIPOS[0], preco: "", estoque: "", imagemUrl: "" });
  };

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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
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
                                {prod.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {!editingProduto && (
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
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                    <select 
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white"
                                        value={formData.tipo}
                                        onChange={e => setFormData({...formData, tipo: e.target.value})}
                                    >
                                        {PRODUTO_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                <input 
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.descricao}
                                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                                />
                            </div>
                        </>
                    )}
                    
                    {editingProduto && (
                         <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-sm mb-4 border border-blue-100">
                            Editando: <strong>{editingProduto.nome}</strong>
                         </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Preço (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                required
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                value={formData.preco}
                                onChange={e => setFormData({...formData, preco: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Qtd. Estoque</label>
                            <input 
                                type="number"
                                required
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
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
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
        )}
    </div>
  );
}
