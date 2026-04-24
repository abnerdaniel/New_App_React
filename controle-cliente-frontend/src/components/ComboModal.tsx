import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import type { Produto, Combo, ComboEtapaEscolha } from '../types';
import { ProductImage } from './ProductImage';

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo: Combo | null;
  onAddToCart: (combo: Combo, quantity: number, extras: { [itemId: number]: Produto[] }, observacao: string, etapasSelecionadas?: ComboEtapaEscolha[]) => void;
  isStoreClosed?: boolean;
}

export function ComboModal({ isOpen, onClose, combo, onAddToCart, isStoreClosed = false }: ComboModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observacao, setObservacao] = useState('');
  
  // Estado para armazenar adicionais selecionados POR ITEM DO COMBO
  const [selectedExtras, setSelectedExtras] = useState<{ [itemId: number]: Produto[] }>({});

  // Estado para armazenar escolhas Dinâmicas de Etapas de Combo
  const [etapasState, setEtapasState] = useState<Record<number, number[]>>({});

  // Reset state when combo changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setObservacao('');
      setSelectedExtras({});
      setEtapasState({});
    }
  }, [isOpen, combo]);

  if (!isOpen || !combo) return null;

  const handleExtraToggle = (itemId: string, extra: Produto) => {
    const key = Number(itemId); 
    
    setSelectedExtras(prev => {
      const currentExtras = prev[key] || [];
      const exists = currentExtras.find(e => e.id === extra.id);
      
      let newExtras;
      if (exists) {
        newExtras = currentExtras.filter(e => e.id !== extra.id);
      } else {
        newExtras = [...currentExtras, extra];
      }
      
      return { ...prev, [key]: newExtras };
    });
  };

  const handleEtapaOpcaoToggle = (etapaId: number, produtoLojaId: number, max: number) => {
      setEtapasState(prev => {
          const selecionadas = prev[etapaId] || [];
          if (selecionadas.includes(produtoLojaId)) {
              return { ...prev, [etapaId]: selecionadas.filter(id => id !== produtoLojaId) };
          }
          if (max === 1) {
              return { ...prev, [etapaId]: [produtoLojaId] };
          }
          if (selecionadas.length < max) {
              return { ...prev, [etapaId]: [...selecionadas, produtoLojaId] };
          }
          return prev;
      });
  };

  // Calcular total adicionais fixing (itens fixos)
  const totalExtras = Object.values(selectedExtras)
      .flat()
      .reduce((acc, extra) => acc + extra.preco, 0);
      
  // Calcular total das etapas dinâmicas (precoAdicional está em centavos, converter para reais)
  const totalEtapas = Object.entries(etapasState).reduce((acc, [eId, pIds]) => {
      const etapaBase = combo.etapas?.find(e => e.id === Number(eId));
      if (!etapaBase) return acc;
      const somaOpcoes = pIds.reduce((sum, pId) => {
          const opt = etapaBase.opcoes.find(o => o.produtoLojaId === pId);
          return sum + (opt ? opt.precoAdicional / 100 : 0);
      }, 0);
      return acc + somaOpcoes;
  }, 0);

  const totalPrice = (combo.preco + totalExtras + totalEtapas) * quantity;

  // Validate Etapas Obras
  const isValid = () => {
      if (!combo.etapas) return true;
      for (const etapa of combo.etapas) {
          const count = (etapasState[etapa.id] || []).length;
          if (etapa.obrigatorio && count < etapa.minEscolhas) return false;
      }
      return true;
  };

  const handleConfirm = () => {
    if (!isValid()) {
       alert("Por favor, selecione todas as opções obrigatórias das etapas.");
       return;
    }
    
    const formatEtapasForCart: ComboEtapaEscolha[] = Object.entries(etapasState).map(([eId, pIds]) => ({
        comboEtapaId: Number(eId),
        opcoes: pIds.map(pId => ({ produtoLojaId: pId, quantidade: 1 }))
    }));

    onAddToCart(combo, quantity, selectedExtras, observacao, formatEtapasForCart);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="relative h-48 bg-orange-50 shrink-0 border-b border-orange-100 flex items-center justify-center p-2">
               <ProductImage 
                  src={combo.imagemUrl} 
                  alt={combo.nome} 
                  className="w-full h-full object-contain mix-blend-multiply"
                  isCombo={true}
                />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white shadow-sm transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2" id="modal-title">
                {combo.nome}
              </h3>
              <p className="text-gray-500 mb-6">{combo.descricao}</p>

              <div className="space-y-6">
                {/* Lista de Itens do Combo */}
                {(combo.itens && combo.itens.length > 0) && (
                <div>
                    <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Itens do Combo</h4>
                    <div className="space-y-4">
                        {combo.itens.map(item => (
                            <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold text-gray-900 text-lg mr-2">{item.quantidade}x</span>
                                        <span className="font-medium text-gray-700">{item.nomeProduto}</span>
                                    </div>
                                </div>
                                
                                {/* Adicionais para este item */}
                                {item.adicionaisDisponiveis && item.adicionaisDisponiveis.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-orange-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Turbine seu item:</p>
                                        <div className="space-y-2">
                                            {item.adicionaisDisponiveis.map(adicional => {
                                                const key = Number(item.id);
                                                const isSelected = selectedExtras[key]?.some(e => e.id === adicional.id);
                                                return (
                                                    <label key={adicional.id} className="flex items-center justify-between cursor-pointer group hover:bg-white p-1 rounded transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="checkbox"
                                                                className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary accent-orange-600"
                                                                checked={isSelected}
                                                                onChange={() => handleExtraToggle(item.id, adicional)}
                                                            />
                                                            <span className="text-gray-700 group-hover:text-gray-900">{adicional.nome}</span>
                                                        </div>
                                                        <span className="text-green-600 font-medium text-sm">
                                                            + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(adicional.preco)}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Etapas Dinâmicas */}
                {(combo.etapas && combo.etapas.length > 0) && (
                    <div className="space-y-6">
                        {combo.etapas.sort((a, b) => a.ordem - b.ordem).map(etapa => {
                            const selecionadas = etapasState[etapa.id] || [];
                            const isValida = !etapa.obrigatorio || selecionadas.length >= etapa.minEscolhas;
                            return (
                                <div key={etapa.id} className={`border rounded-lg overflow-hidden ${isValida ? 'border-gray-200' : 'border-orange-300 ring-1 ring-orange-100'}`}>
                                    <div className={`bg-gray-50 px-4 py-3 flex justify-between items-center border-b ${isValida ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'}`}>
                                        <h4 className="font-bold text-gray-800">{etapa.titulo}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                                            {etapa.obrigatorio ? `Escolha de ${etapa.minEscolhas} a ${etapa.maxEscolhas}` : `Até ${etapa.maxEscolhas} (Opcional)`}
                                        </span>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {etapa.opcoes.map(opcao => {
                                            const checked = selecionadas.includes(opcao.produtoLojaId);
                                            const disabled = !checked && selecionadas.length >= (etapa.maxEscolhas || 1);
                                            const handleClick = () => {
                                                if (disabled) return;
                                                handleEtapaOpcaoToggle(etapa.id, opcao.produtoLojaId, etapa.maxEscolhas);
                                            };
                                            return (
                                                <div 
                                                    key={opcao.id}
                                                    onClick={handleClick}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-transparent' :
                                                        checked ? 'border-brand-primary bg-brand-primary/5 shadow-sm cursor-pointer' : 
                                                        'border-transparent hover:bg-gray-50 cursor-pointer'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 flex items-center justify-center border-2 transition-colors ${
                                                            etapa.maxEscolhas === 1 ? 'rounded-full' : 'rounded'
                                                        } ${
                                                            checked ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {checked && <div className={`bg-white ${ etapa.maxEscolhas === 1 ? 'w-1.5 h-1.5 rounded-full' : 'w-2 h-2 rounded-sm' }`} />}
                                                        </div>
                                                        <span className="font-medium text-gray-700 text-sm">{opcao.nomeProduto}</span>
                                                    </div>
                                                    {opcao.precoAdicional > 0 && (
                                                        <span className="text-brand-primary font-bold text-xs">
                                                            + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opcao.precoAdicional / 100)}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações do Combo
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder=""
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none h-24"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
                <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-gray-500 hover:text-brand-primary disabled:opacity-50"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-bold w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-1 text-gray-500 hover:text-brand-primary"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={isStoreClosed}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-between transition-transform 
                    ${isStoreClosed 
                      ? 'bg-gray-400 cursor-not-allowed text-gray-100 shadow-none' 
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/30 active:scale-95'
                    }`}
                >
                  <span>{isStoreClosed ? 'Loja Fechada' : 'Adicionar Combo'}</span>
                  {!isStoreClosed && (
                    <span>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
                    </span>
                  )}
                </button>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}
