import { useState } from 'react';
import { X, Plus, Trash2, Pencil, Check, Loader2 } from 'lucide-react';
import { useTiposProduto } from '../hooks/useTiposProduto';
import type { TipoProduto } from '../hooks/useTiposProduto';

interface Props {
  lojaId: string;
  onClose: () => void;
  onSelect?: (tipo: TipoProduto) => void;
}

export function TiposProdutoModal({ lojaId, onClose, onSelect }: Props) {
  const { tipos, loading, criar, atualizar, excluir } = useTiposProduto(lojaId);
  const [novoNome, setNovoNome] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      await criar(novoNome);
      setNovoNome('');
    } finally {
      setSalvando(false);
    }
  }

  async function handleAtualizar() {
    if (!editandoId || !editNome.trim()) return;
    setSalvando(true);
    try {
      await atualizar(editandoId, editNome);
      setEditandoId(null);
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm('Ao excluir, os produtos que usam este tipo ficarão sem tipo. Continuar?')) return;
    await excluir(id);
  }

  return (
    // z-[200] garante que apareça acima de qualquer modal anterior (z-50)
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">Tipos de Produto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCriar} className="px-5 py-3 border-b bg-gray-50">
          <div className="flex gap-2">
            <input
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              placeholder="Novo tipo (ex: Pizza, Roupa...)"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={salvando || !novoNome.trim()}
              className="bg-brand-primary text-white px-3 py-2 rounded-lg hover:bg-brand-hover disabled:opacity-50 flex items-center"
            >
              {salvando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {loading ? (
            <div className="text-center py-6 text-gray-400">
              <Loader2 className="animate-spin mx-auto mb-2" size={22} />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : tipos.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400 border-2 border-dashed rounded-xl">
              Nenhum tipo criado ainda.
            </p>
          ) : (
            tipos.map(t => (
              <div key={t.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 group">
                {editandoId === t.id ? (
                  <>
                    <input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      autoFocus
                    />
                    <button onClick={handleAtualizar} className="p-1 text-green-600 hover:text-green-700">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditandoId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex-1 text-sm font-medium text-gray-700 ${onSelect ? 'cursor-pointer hover:text-brand-primary' : ''}`}
                      onClick={() => onSelect?.(t)}
                    >
                      {t.nome}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditandoId(t.id); setEditNome(t.nome); }} className="p-1 text-gray-400 hover:text-blue-600">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleExcluir(t.id)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t">
          <button onClick={onClose} className="w-full py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
