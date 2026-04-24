import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import type { Produto, ProdutoVariante, GrupoOpcao, OpcaoItemCliente } from '../types';
import { ImageCarousel } from './ImageCarousel';

interface ProductModalProps {
  produto: Produto | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (produto: Produto, quantidade: number, observacao: string, extras: Produto[], opcoesSelecionadas?: OpcaoItemCliente[]) => void;
  isStoreClosed?: boolean;
}

export function ProductModal({ produto, isOpen, onClose, onAddToCart, isStoreClosed = false }: ProductModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<Produto[]>([]);
  
  // Inicialização de variantes baseada no produto atual
  const [selectedAtributos, setSelectedAtributos] = useState<Record<string, string>>(() => {
    if (produto?.variantes && produto.variantes.length > 0) {
      const primeiraDisponivel = produto.variantes.find(v => v.disponivel && v.estoque > 0) || produto.variantes[0];
      const newAttrs: Record<string, string> = {};
      primeiraDisponivel.atributos.forEach(a => newAttrs[a.nomeAtributo] = a.valor);
      return newAttrs;
    }
    return {};
  });

  const [currentVariante, setCurrentVariante] = useState<ProdutoVariante | null>(() => {
    if (produto?.variantes && produto.variantes.length > 0) {
      return produto.variantes.find(v => v.disponivel && v.estoque > 0) || produto.variantes[0];
    }
    return null;
  });

  const [selectedOpcoes, setSelectedOpcoes] = useState<Record<number, OpcaoItemCliente[]>>({});

  if (!isOpen || !produto) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getExtraQuantity = (extraId: string) => {
    return selectedExtras.filter(e => e.id === extraId).length;
  };

  const updateExtraQuantity = (extra: Produto, newQty: number) => {
    setSelectedExtras(current => {
      const others = current.filter(e => e.id !== extra.id);
      const newAdditions = Array(Math.max(0, newQty)).fill(extra);
      return [...others, ...newAdditions];
    });
  };

  const getExtraDetail = (extraId: string) => {
    return produto.adicionaisDetalhes?.find(d => String(d.produtoFilhoId) === String(extraId));
  };

  const updateAtributo = (nomeAtributo: string, valor: string) => {
    const newAttrs = { ...selectedAtributos, [nomeAtributo]: valor };
    setSelectedAtributos(newAttrs);
    
    // Find matching variant
    const matched = produto?.variantes?.find(v => 
      v.atributos.every(a => newAttrs[a.nomeAtributo] === a.valor)
    );
    setCurrentVariante(matched || null);
  };

  const extrasTotal = selectedExtras.reduce((acc, extra) => acc + extra.preco, 0);
  const basePrice = currentVariante ? currentVariante.preco : produto.preco;
  const opcoesTotal = Object.values(selectedOpcoes).flat().reduce((acc, i) => acc + i.preco, 0);
  const total = (basePrice + extrasTotal + opcoesTotal) * quantidade;

  // Verifica se todos os grupos obrigatórios estão satisfeitos
  const gruposInvalidos = (produto.gruposOpcao || []).filter(g => {
    const sel = selectedOpcoes[g.id] || [];
    return sel.length < g.minSelecao;
  });
  const opcoesPendentes = gruposInvalidos.length > 0;

  const toggleOpcao = (grupo: GrupoOpcao, item: OpcaoItemCliente) => {
    setSelectedOpcoes(prev => {
      const atual = prev[grupo.id] || [];
      const jaTemItem = atual.some(i => i.id === item.id);
      if (jaTemItem) {
        return { ...prev, [grupo.id]: atual.filter(i => i.id !== item.id) };
      }
      if (grupo.maxSelecao === 1) {
        return { ...prev, [grupo.id]: [item] };
      }
      if (atual.length >= grupo.maxSelecao) return prev;
      return { ...prev, [grupo.id]: [...atual, item] };
    });
  };

  // Format currency helper
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Imagem ou Titulo */}
        <div className="relative bg-gray-50 border-b border-gray-100">
          <div className="h-48 md:h-56 w-full flex items-center justify-center">
            <ImageCarousel 
              imagens={produto.imagens}
              fallbackUrl={currentVariante?.imagemUrl || produto.imagemUrl}
              produtoNome={produto.nome}
              produtoTipo={produto.tipo}
            />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{produto.nome}</h2>
            {basePrice > 0 && <span className="text-lg font-bold text-green-700">{formatCurrency(basePrice)}</span>}
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">{produto.descricao}</p>

          {/* Variantes / Atributos */}
          {produto.variantes && produto.variantes.length > 0 && (
            <div className="mb-6 space-y-4">
              {Array.from(new Set(produto.variantes.flatMap(v => v.atributos.map(a => a.nomeAtributo)))).map(nomeAtributo => {
                const valoresUnicos = new Map();
                produto.variantes!.forEach(v => {
                  v.atributos.forEach(a => {
                    if (a.nomeAtributo === nomeAtributo) {
                      valoresUnicos.set(a.valor, a);
                    }
                  });
                });
                const valores = Array.from(valoresUnicos.values());
                
                return (
                  <div key={nomeAtributo}>
                     <h3 className="font-semibold text-gray-800 mb-2">{nomeAtributo}</h3>
                     <div className="flex flex-wrap gap-2">
                       {valores.map(item => {
                          const isSelected = selectedAtributos[nomeAtributo] === item.valor;
                          return (
                             <button 
                               key={item.valor}
                               type="button"
                               onClick={() => updateAtributo(nomeAtributo, item.valor)}
                               className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                                  isSelected ? 'border-red-600 bg-red-50 text-red-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                               }`}
                             >
                               {item.codigoHex && (
                                 <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: item.codigoHex }} />
                               )}
                               {item.valor}
                             </button>
                          )
                       })}
                     </div>
                  </div>
                )
              })}
              
              {/* Alerta de Variante */}
              {(!currentVariante || !currentVariante.disponivel || currentVariante.estoque <= 0) && (
                 <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                    {currentVariante ? 'Esgotado: Esta variação não possui estoque.' : 'Combinação inválida: Não existe essa variação.'}
                 </div>
              )}
            </div>
          )}

          {/* Grupos de Opção (Produto Configurável) */}
          {produto.gruposOpcao && produto.gruposOpcao.length > 0 && (
            <div className="mb-6 space-y-5">
              {produto.gruposOpcao.map(grupo => {
                const sel = selectedOpcoes[grupo.id] || [];
                const valido = sel.length >= grupo.minSelecao;
                return (
                  <div key={grupo.id}>
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{grupo.nome}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        grupo.obrigatorio ? (valido ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600') : 'bg-gray-100 text-gray-500'
                      }`}>
                        {grupo.obrigatorio ? (valido ? 'OK' : `Escolha ${grupo.minSelecao > 1 ? `${grupo.minSelecao}–` : ''}${grupo.maxSelecao}`) : `Até ${grupo.maxSelecao}`}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {grupo.itens.map(item => {
                        const isSelected = sel.some(i => i.id === item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleOpcao(grupo, item)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                              isSelected ? 'border-red-500 bg-red-50 text-red-800 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <span>{item.nome}</span>
                            {item.preco > 0 && (
                              <span className="text-gray-500 text-xs">
                                +{formatCurrency(item.preco)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Adicionais / Extras */}
          {produto.adicionais && produto.adicionais.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Adicionais</h3>
              <div className="space-y-2">
                {produto.adicionais.map(extra => {
                   const qty = getExtraQuantity(extra.id);
                   const detail = getExtraDetail(extra.id);
                   const maxQty = detail?.quantidadeMaxima !== undefined && detail.quantidadeMaxima >= 0 ? detail.quantidadeMaxima : 99;
                   const minQty = detail?.quantidadeMinima || 0;
                   const isSelected = qty > 0;
                   const precoAdicional = detail?.precoOverride !== null && detail?.precoOverride !== undefined ? detail.precoOverride : extra.preco;

                   return (
                     <div 
                        key={extra.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                     >
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900 font-medium">{extra.nome}</span>
                          <span className="text-gray-600 text-sm">
                            +{formatCurrency(precoAdicional)}
                          </span>
                        </div>
                        
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                           <button
                             type="button"
                             onClick={() => updateExtraQuantity({ ...extra, preco: precoAdicional }, qty - 1)}
                             disabled={qty <= minQty}
                             className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                           >
                             <Minus className="w-4 h-4" />
                           </button>
                           <span className="w-8 text-center font-medium text-gray-800 text-sm">{qty}</span>
                           <button
                             type="button"
                             onClick={() => updateExtraQuantity({ ...extra, preco: precoAdicional }, qty + 1)}
                             disabled={qty >= maxQty}
                             className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="obs" className="block text-sm font-medium text-gray-700 mb-2">
              Alguma observação?
            </label>
            <textarea
              id="obs"
              rows={3}
              placeholder=""
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <button 
                onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                className="p-3 text-red-600 hover:bg-red-50 rounded-l-lg transition-colors disabled:opacity-50"
                disabled={quantidade <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{quantidade}</span>
              <button 
                onClick={() => setQuantidade(q => q + 1)}
                className="p-3 text-red-600 hover:bg-red-50 rounded-r-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => onAddToCart({ 
                ...produto, 
                produtoVarianteId: currentVariante?.id,
                preco: basePrice, // Atualiza preço base no carrinho pra ser o da variação
              }, quantidade, observacao, selectedExtras, Object.values(selectedOpcoes).flat())}
              disabled={isStoreClosed || opcoesPendentes || (!!produto.variantes?.length && (!currentVariante || !currentVariante.disponivel || currentVariante.estoque <= 0))}
              className={`flex-1 font-semibold py-3 px-4 rounded-lg flex justify-between items-center shadow-md transition-all duration-200
                ${isStoreClosed || (!!produto.variantes?.length && (!currentVariante || !currentVariante.disponivel || currentVariante.estoque <= 0))
                  ? 'bg-gray-400 cursor-not-allowed text-gray-100' 
                  : opcoesPendentes 
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform active:scale-[0.98]'
                }`}
            >
              <span>{isStoreClosed ? 'Loja Fechada' : ((!!produto.variantes?.length && (!currentVariante || !currentVariante.disponivel || currentVariante.estoque <= 0)) ? 'Esgotado' : opcoesPendentes ? 'Escolha as opções' : 'Adicionar')}</span>
              {(!isStoreClosed && !(!!produto.variantes?.length && (!currentVariante || !currentVariante.disponivel || currentVariante.estoque <= 0)) && !opcoesPendentes) && <span>{formatCurrency(total)}</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
