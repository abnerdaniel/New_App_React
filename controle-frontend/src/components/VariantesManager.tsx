import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Trash2, Plus, RefreshCw, Save, Upload, Loader2 } from 'lucide-react';
import { cloudinaryService } from '../services/cloudinary.service';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AtributoValor {
  id: number;
  valor: string;
  codigoHex?: string;
}

interface Atributo {
  id: number;
  nome: string;
  valores: AtributoValor[];
}

interface VarianteAtributo {
  valorId: number;
  nomeAtributo: string;
  valor: string;
  codigoHex?: string;
}

interface Variante {
  id: number;
  sku: string;
  preco: number;
  estoque: number;
  disponivel: boolean;
  imagemUrl?: string;
  atributos: VarianteAtributo[];
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface VariantesManagerProps {
  produtoLojaId: number;
  lojaId: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VariantesManager({ produtoLojaId, lojaId }: VariantesManagerProps) {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [atributosSelecionados, setAtributosSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingVariantId, setUploadingVariantId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'atributos' | 'grade'>('grade');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(null);

  // Form para novo atributo
  const [novoAtributo, setNovoAtributo] = useState('');
  const [novoValor, setNovoValor] = useState<Record<number, string>>({});
  const [novoHex, setNovoHex] = useState<Record<number, string>>({});

  const carregarAtributos = useCallback(async () => {
    if (!lojaId) return;
    const res = await api.get<Atributo[]>(`/api/atributos?lojaId=${lojaId}`);
    setAtributos(res.data);
  }, [lojaId]);

  const carregarVariantes = useCallback(async () => {
    const res = await api.get<Variante[]>(`/api/produto-loja/${produtoLojaId}/variantes`);
    setVariantes(res.data.map(v => ({ ...v, preco: v.preco / 100 })));
  }, [produtoLojaId]);

  useEffect(() => {
    carregarAtributos();
    carregarVariantes();
  }, [carregarAtributos, carregarVariantes]);

  // ── Atributos ──────────────────────────────────────────────────────────────

  const criarAtributo = async () => {
    if (!novoAtributo.trim()) return;
    await api.post<Atributo>(`/api/atributos?lojaId=${lojaId}`, { nome: novoAtributo });
    setNovoAtributo('');
    carregarAtributos();
  };

  const adicionarValor = async (atributoId: number) => {
    const val = novoValor[atributoId]?.trim();
    if (!val) return;
    await api.post(`/api/atributos/${atributoId}/valores`, {
      valor: val,
      codigoHex: novoHex[atributoId] || null,
    });
    setNovoValor(prev => ({ ...prev, [atributoId]: '' }));
    setNovoHex(prev => ({ ...prev, [atributoId]: '' }));
    carregarAtributos();
  };

  const removerAtributo = async (id: number) => {
    if (!confirm('Remover atributo e todos seus valores?')) return;
    await api.delete(`/api/atributos/${id}`);
    carregarAtributos();
  };

  const removerValor = async (id: number) => {
    await api.delete(`/api/atributos/valores/${id}`);
    carregarAtributos();
  };

  // ── Grade de Variantes ─────────────────────────────────────────────────────

  const gerarGrade = async () => {
    if (!atributosSelecionados.length) return;
    setLoading(true);
    const res = await api.post<Variante[]>(`/api/produto-loja/${produtoLojaId}/gerar-variantes`, {
      atributoIds: atributosSelecionados,
    });
    setVariantes(res.data.map(v => ({ ...v, preco: v.preco / 100 })));
    setLoading(false);
  };

  const salvarGrade = async () => {
    setSaving(true);
    await api.put(`/api/produto-loja/${produtoLojaId}/variantes`, {
      variantes: variantes.map(v => ({
        id: v.id || null,
        sku: v.sku,
        preco: Math.round(v.preco * 100),
        estoque: v.estoque,
        disponivel: v.disponivel,
        imagemUrl: v.imagemUrl || null,
        valorIds: v.atributos.map(a => a.valorId),
      })),
    });
    setSaving(false);
    carregarVariantes();
  };

  const updateVariante = (index: number, field: keyof Variante, value: unknown) => {
    setVariantes(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handlePrecoChange = (index: number, val: string) => {
    let clean = val.replace(/\D/g, '');
    if (!clean) clean = '0';
    const cents = parseInt(clean, 10);
    updateVariante(index, 'preco', cents / 100);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUploadIndex === null || !e.target.files?.length) return;
    setUploadingVariantId(currentUploadIndex);
    try {
        const url = await cloudinaryService.uploadImage(e.target.files[0]);
        updateVariante(currentUploadIndex, 'imagemUrl', url);
    } catch {
        alert("Erro ao enviar foto da variante.");
    } finally {
        setUploadingVariantId(null);
        setCurrentUploadIndex(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 border rounded-xl overflow-hidden relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      {/* Tabs */}
      <div className="flex bg-gray-100 text-sm font-medium">
        {(['grade', 'atributos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 transition-colors ${activeTab === tab ? 'bg-white text-red-600 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'grade' ? '📋 Grade de Variantes' : '🏷️ Atributos da Loja'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* ── Tab: Atributos ── */}
        {activeTab === 'atributos' && (
          <div className="space-y-4">
            {/* Criar novo atributo */}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="Nome do atributo (ex: Tamanho, Cor)"
                value={novoAtributo}
                onChange={e => setNovoAtributo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && criarAtributo()}
              />
              <button
                onClick={criarAtributo}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
              >
                <Plus size={14} /> Criar
              </button>
            </div>

            {/* Lista de atributos */}
            {atributos.map(atr => (
              <div key={atr.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{atr.nome}</span>
                  <button onClick={() => removerAtributo(atr.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Valores existentes */}
                <div className="flex flex-wrap gap-1">
                  {atr.valores.map(v => (
                    <span
                      key={v.id}
                      className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-1"
                    >
                      {v.codigoHex && (
                        <span
                          className="w-3 h-3 rounded-full inline-block border border-gray-300"
                          style={{ background: v.codigoHex }}
                        />
                      )}
                      {v.valor}
                      <button onClick={() => removerValor(v.id)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                    </span>
                  ))}
                </div>

                {/* Adicionar valor */}
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-2 py-1 text-sm"
                    placeholder="Valor (ex: M)"
                    value={novoValor[atr.id] || ''}
                    onChange={e => setNovoValor(prev => ({ ...prev, [atr.id]: e.target.value }))}
                  />
                  {/* Color picker apenas se o atributo se chama Cor */}
                  {atr.nome.toLowerCase().includes('cor') && (
                    <input
                      type="color"
                      className="w-9 h-9 rounded border cursor-pointer"
                      title="Cor hex"
                      value={novoHex[atr.id] || '#000000'}
                      onChange={e => setNovoHex(prev => ({ ...prev, [atr.id]: e.target.value }))}
                    />
                  )}
                  <button
                    onClick={() => adicionarValor(atr.id)}
                    className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-900 flex items-center gap-1"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Grade ── */}
        {activeTab === 'grade' && (
          <div className="space-y-4">
            {/* Seletor de atributos para gerar grade */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Selecione os atributos para gerar a grade:</p>
              <div className="flex flex-wrap gap-2">
                {atributos.map(atr => (
                  <label key={atr.id} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-red-600"
                      checked={atributosSelecionados.includes(atr.id)}
                      onChange={e => {
                        setAtributosSelecionados(prev =>
                          e.target.checked ? [...prev, atr.id] : prev.filter(id => id !== atr.id)
                        );
                      }}
                    />
                    {atr.nome}
                  </label>
                ))}
              </div>
              <button
                onClick={gerarGrade}
                disabled={!atributosSelecionados.length || loading}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-900 disabled:opacity-40"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Gerar Grade
              </button>
            </div>

            {/* Tabela de variantes */}
            {variantes.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <th className="text-left p-2 border">Variante</th>
                        <th className="p-2 border">SKU</th>
                        <th className="p-2 border">Preço (R$)</th>
                        <th className="p-2 border">Estoque</th>
                        <th className="p-2 border">Disponível</th>
                        <th className="p-2 border">Imagem URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantes.map((v, i) => (
                        <tr
                          key={i}
                          className={`transition-colors ${v.estoque === 0 ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                        >
                          {/* Combinação de atributos */}
                          <td className="p-2 border">
                            <div className="flex flex-wrap gap-1">
                              {v.atributos.map(a => (
                                <span
                                  key={a.valorId}
                                  className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5"
                                >
                                  {a.codigoHex && (
                                    <span
                                      className="w-3 h-3 rounded-full border border-gray-300"
                                      style={{ background: a.codigoHex }}
                                    />
                                  )}
                                  <span className="text-gray-500">{a.nomeAtributo}:</span> {a.valor}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-2 border">
                            <input
                              className="w-24 border rounded px-1 py-0.5 text-xs"
                              value={v.sku}
                              onChange={e => updateVariante(i, 'sku', e.target.value)}
                            />
                          </td>
                          <td className="p-2 border">
                            <input
                              type="text"
                              className="w-20 border rounded px-1 py-0.5 text-xs text-right"
                              value={v.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              onChange={e => handlePrecoChange(i, e.target.value)}
                            />
                          </td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              min="0"
                              className="w-16 border rounded px-1 py-0.5 text-xs"
                              value={v.estoque}
                              onChange={e => updateVariante(i, 'estoque', parseInt(e.target.value))}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <input
                              type="checkbox"
                              className="accent-red-600"
                              checked={v.disponivel}
                              onChange={e => updateVariante(i, 'disponivel', e.target.checked)}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <div className="flex flex-col items-center gap-1">
                               {v.imagemUrl && (
                                   <div className="relative group">
                                     <img src={v.imagemUrl} alt="Variante" className="w-10 h-10 object-cover rounded shadow" />
                                     <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded">
                                        <button onClick={() => updateVariante(i, 'imagemUrl', '')} className="text-white hover:text-red-400">
                                            <Trash2 size={12} />
                                        </button>
                                     </div>
                                   </div>
                               )}
                               {!v.imagemUrl && (
                                   <button 
                                      onClick={() => { setCurrentUploadIndex(i); fileInputRef.current?.click(); }}
                                      disabled={uploadingVariantId === i}
                                      className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                   >
                                      {uploadingVariantId === i ? <Loader2 size={14} className="animate-spin text-gray-500" /> : <Upload size={14} className="text-gray-500" />}
                                   </button>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={salvarGrade}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-40"
                >
                  <Save size={14} />
                  {saving ? 'Salvando...' : 'Salvar Grade'}
                </button>
              </>
            )}

            {!variantes.length && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-400 italic">Nenhuma variante configurada. Selecione os atributos acima e clique em "Gerar Grade".</p>
                <button
                  onClick={salvarGrade}
                  disabled={saving}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 disabled:opacity-40"
                >
                  {saving ? 'Removendo...' : 'Zerar/Remover Grade do Produto'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
