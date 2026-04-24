import { ShoppingBag, Info, ChevronRight } from 'lucide-react';

interface CardPreviewProps {
  nome?: string;
  descricao?: string;
  preco?: number;
  imagemUrl?: string;
  tipoProdutoNome?: string;
  tipoProdutoIcone?: string;
  modoCardapio?: string;
  disponivel?: boolean;
}

const MODO_BADGE: Record<string, { label: string; color: string }> = {
  Configuravel: { label: '🧩 Personalizável', color: 'bg-blue-100 text-blue-700' },
  Kg:           { label: '⚖️ Venda por Peso', color: 'bg-amber-100 text-amber-700' },
  Simples:      { label: '', color: '' },
};

export function CardPreview({
  nome = 'Nome do produto',
  descricao,
  preco,
  imagemUrl,
  tipoProdutoNome,
  tipoProdutoIcone,
  modoCardapio = 'Simples',
  disponivel = true,
}: CardPreviewProps) {
  const modo = MODO_BADGE[modoCardapio] ?? MODO_BADGE.Simples;

  return (
    <div className="sticky top-24">
      <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
        <Info size={12} /> Pré-visualização do card
      </p>

      {/* Phone mock wrapper */}
      <div className="mx-auto w-full max-w-[260px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden select-none">
        {/* Image */}
        <div className="relative h-36 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
          {imagemUrl ? (
            <img src={imagemUrl} alt={nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
          )}
          {!disponivel && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Indisponível</span>
            </div>
          )}
          {tipoProdutoNome && (
            <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              {tipoProdutoIcone && <span>{tipoProdutoIcone}</span>}
              {tipoProdutoNome}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-1.5">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
            {nome}
          </h3>

          {descricao && (
            <p className="text-[11px] text-gray-500 line-clamp-2">{descricao}</p>
          )}

          {modo.label && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${modo.color}`}>
              {modo.label}
            </span>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-base font-black text-emerald-600">
              {preco != null
                ? (preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'R$ —'}
              {modoCardapio === 'Kg' && <span className="text-xs font-normal text-gray-400"> /kg</span>}
            </span>
            <button className="flex items-center gap-0.5 bg-brand-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-brand-hover transition-colors pointer-events-none">
              Adicionar <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-3">
        Aparência aproximada na vitrine do cliente
      </p>
    </div>
  );
}
