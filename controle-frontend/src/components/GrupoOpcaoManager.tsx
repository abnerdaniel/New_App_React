import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { Plus, Trash2, Save, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

interface OpcaoItem {
  id?: number;
  grupoOpcaoId?: number;
  nome: string;
  preco: number; // centavos
  ordem: number;
  ativo: boolean;
}

interface GrupoOpcao {
  id?: number;
  produtoLojaId?: number;
  nome: string;
  ordem: number;
  minSelecao: number;
  maxSelecao: number;
  obrigatorio: boolean;
  itens: OpcaoItem[];
}

interface Props {
  produtoLojaId: number;
}

const fmtPrice = (centavos: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);

const parseCurrency = (value: string): number => {
  const digits = value.replace(/\D/g, "");
  return parseInt(digits || "0", 10);
};

const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "") || "0";
  const cents = parseInt(digits, 10);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};

export function GrupoOpcaoManager({ produtoLojaId }: Props) {
  const [grupos, setGrupos] = useState<GrupoOpcao[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/produto-loja/${produtoLojaId}/grupos-opcao`);
      setGrupos(res.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [produtoLojaId]);

  useEffect(() => { load(); }, [load]);

  const toggleCollapse = (idx: number) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const addGrupo = () =>
    setGrupos(prev => [
      ...prev,
      { nome: "Novo Grupo", ordem: prev.length, minSelecao: 1, maxSelecao: 1, obrigatorio: true, itens: [] },
    ]);

  const updateGrupo = (idx: number, key: keyof GrupoOpcao, value: unknown) =>
    setGrupos(prev => prev.map((g, i) => (i === idx ? { ...g, [key]: value } : g)));

  const removeGrupo = async (idx: number) => {
    const g = grupos[idx];
    if (g.id) {
      try { await api.delete(`/api/produto-loja/${produtoLojaId}/grupos-opcao/${g.id}`); } catch { return; }
    }
    setGrupos(prev => prev.filter((_, i) => i !== idx));
  };

  const saveGrupo = async (idx: number) => {
    const g = grupos[idx];
    setSaving(idx);
    try {
      const payload = {
        nome: g.nome,
        ordem: g.ordem,
        minSelecao: g.minSelecao,
        maxSelecao: g.maxSelecao,
        obrigatorio: g.obrigatorio,
      };
      if (g.id) {
        await api.put(`/api/produto-loja/${produtoLojaId}/grupos-opcao/${g.id}`, payload);
      } else {
        const res = await api.post(`/api/produto-loja/${produtoLojaId}/grupos-opcao`, payload);
        const newId = res.data.id;
        // Save itens
        for (const item of g.itens) {
          await api.post(`/api/produto-loja/${produtoLojaId}/grupos-opcao/${newId}/itens`, {
            nome: item.nome, preco: item.preco, ordem: item.ordem, ativo: item.ativo,
          });
        }
        await load();
        return;
      }
      // Save / update itens
      for (const item of g.itens) {
        if (item.id) {
          await api.put(`/api/produto-loja/${produtoLojaId}/grupos-opcao/${g.id}/itens/${item.id}`, {
            nome: item.nome, preco: item.preco, ordem: item.ordem, ativo: item.ativo,
          });
        } else {
          await api.post(`/api/produto-loja/${produtoLojaId}/grupos-opcao/${g.id}/itens`, {
            nome: item.nome, preco: item.preco, ordem: item.ordem, ativo: item.ativo,
          });
        }
      }
      await load();
    } catch {
      alert("Erro ao salvar grupo.");
    } finally {
      setSaving(null);
    }
  };

  const addItem = (grupoIdx: number) =>
    setGrupos(prev =>
      prev.map((g, i) =>
        i === grupoIdx
          ? { ...g, itens: [...g.itens, { nome: "", preco: 0, ordem: g.itens.length, ativo: true }] }
          : g
      )
    );

  const updateItem = (grupoIdx: number, itemIdx: number, key: keyof OpcaoItem, value: unknown) =>
    setGrupos(prev =>
      prev.map((g, i) =>
        i === grupoIdx
          ? { ...g, itens: g.itens.map((item, j) => (j === itemIdx ? { ...item, [key]: value } : item)) }
          : g
      )
    );

  const removeItem = async (grupoIdx: number, itemIdx: number) => {
    const g = grupos[grupoIdx];
    const item = g.itens[itemIdx];
    if (g.id && item.id) {
      try { await api.delete(`/api/produto-loja/${produtoLojaId}/grupos-opcao/${g.id}/itens/${item.id}`); } catch { return; }
    }
    setGrupos(prev =>
      prev.map((gr, i) =>
        i === grupoIdx ? { ...gr, itens: gr.itens.filter((_, j) => j !== itemIdx) } : gr
      )
    );
  };

  if (loading) return <div className="text-center py-6 text-gray-400 text-sm">Carregando grupos...</div>;

  return (
    <div className="space-y-4">
      {grupos.map((grupo, gi) => (
        <div key={gi} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Cabeçalho do Grupo */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <GripVertical size={16} className="text-gray-300 shrink-0" />
            <input
              className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
              placeholder="Nome do grupo (ex: Tamanho, Borda, Sabor)"
              value={grupo.nome}
              onChange={e => updateGrupo(gi, "nome", e.target.value)}
            />
            <button type="button" onClick={() => toggleCollapse(gi)} className="text-gray-400 hover:text-gray-600">
              {collapsed.has(gi) ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button type="button" onClick={() => saveGrupo(gi)} disabled={saving === gi}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-brand-primary text-white rounded-md hover:opacity-90 disabled:opacity-50">
              <Save size={12} /> {saving === gi ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => removeGrupo(gi)} className="text-red-400 hover:text-red-600 p-1">
              <Trash2 size={15} />
            </button>
          </div>

          {!collapsed.has(gi) && (
            <div className="p-4 space-y-3">
              {/* Config do grupo */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-500 uppercase">Mín. Seleção</label>
                  <input type="number" min={0} value={grupo.minSelecao}
                    onChange={e => updateGrupo(gi, "minSelecao", Number(e.target.value))}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="font-bold text-gray-500 uppercase">Máx. Seleção</label>
                  <input type="number" min={1} value={grupo.maxSelecao}
                    onChange={e => updateGrupo(gi, "maxSelecao", Number(e.target.value))}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="font-bold text-gray-500 uppercase mb-1">Obrigatório</label>
                  <button type="button" onClick={() => updateGrupo(gi, "obrigatorio", !grupo.obrigatorio)}
                    className={`w-full py-1.5 rounded-lg text-sm font-medium border transition-colors ${grupo.obrigatorio ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    {grupo.obrigatorio ? "Sim" : "Não"}
                  </button>
                </div>
              </div>

              {/* Itens */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Opções</p>
                {grupo.itens.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                      placeholder="Nome da opção"
                      value={item.nome}
                      onChange={e => updateItem(gi, ii, "nome", e.target.value)}
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                      <input
                        className="w-full pl-7 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right"
                        placeholder="0,00"
                        value={formatCurrencyInput(String(item.preco))}
                        onChange={e => updateItem(gi, ii, "preco", parseCurrency(e.target.value))}
                      />
                    </div>
                    <button type="button" onClick={() => removeItem(gi, ii)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addItem(gi)}
                  className="flex items-center gap-1 text-xs text-brand-primary hover:underline mt-1">
                  <Plus size={12} /> Adicionar opção
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addGrupo}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Adicionar Grupo de Opções
      </button>
    </div>
  );
}
