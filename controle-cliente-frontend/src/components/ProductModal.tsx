import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import type { Produto } from '../types';

interface ProductModalProps {
  produto: Produto | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (produto: Produto, quantidade: number, observacao: string, extras: Produto[]) => void;
  isStoreClosed?: boolean;
}

export function ProductModal({ produto, isOpen, onClose, onAddToCart, isStoreClosed = false }: ProductModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<Produto[]>([]);

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setQuantidade(1);
      setObservacao('');
      setSelectedExtras([]);
    }
  }, [isOpen, produto]);

  if (!isOpen || !produto) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleExtra = (extra: Produto) => {
    setSelectedExtras(current => {
      const exists = current.find(e => e.id === extra.id);
      if (exists) {
        return current.filter(e => e.id !== extra.id);
      }
      return [...current, extra];
    });
  };

  const extrasTotal = selectedExtras.reduce((acc, extra) => acc + extra.preco, 0);
  const total = (produto.preco + extrasTotal) * quantidade;

  // Format currency helper
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Imagem ou Titulo */}
        <div className="relative">
          {produto.imagemUrl ? (
            <div className="h-48 md:h-56 w-full">
              <img 
                src={produto.imagemUrl} 
                alt={produto.nome} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 bg-red-600"></div>
          )}
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
            <span className="text-lg font-bold text-green-700">{formatCurrency(produto.preco)}</span>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">{produto.descricao}</p>

          {/* Adicionais / Extras */}
          {produto.adicionais && produto.adicionais.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Adicionais</h3>
              <div className="space-y-2">
                {produto.adicionais.map(extra => {
                   const isSelected = selectedExtras.some(e => e.id === extra.id);
                   return (
                     <label 
                        key={extra.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                     >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleExtra(extra)}
                            className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-gray-700 font-medium">{extra.nome}</span>
                        </div>
                        <span className="text-gray-600 font-medium">
                          +{formatCurrency(extra.preco)}
                        </span>
                     </label>
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
              placeholder="Ex: Tirar a cebola, molho à parte..."
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
              onClick={() => onAddToCart(produto, quantidade, observacao, selectedExtras)}
              disabled={isStoreClosed}
              className={`flex-1 font-semibold py-3 px-4 rounded-lg flex justify-between items-center shadow-md transition-all duration-200
                ${isStoreClosed 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-100' 
                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform active:scale-[0.98]'
                }`}
            >
              <span>{isStoreClosed ? 'Loja Fechada' : 'Adicionar'}</span>
              {!isStoreClosed && <span>{formatCurrency(total)}</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
