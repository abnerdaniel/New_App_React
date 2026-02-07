import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import type { Produto } from '../types';

interface ProductModalProps {
  produto: Produto | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (produto: Produto, quantidade: number, observacao: string) => void;
}

export function ProductModal({ produto, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setQuantidade(1);
      setObservacao('');
    }
  }, [isOpen, produto]);

  if (!isOpen || !produto) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const total = produto.preco * quantidade;

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{produto.nome}</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{produto.descricao}</p>

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
              onClick={() => onAddToCart(produto, quantidade, observacao)}
              className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex justify-between items-center shadow-md hover:shadow-lg transform active:scale-[0.98] duration-100"
            >
              <span>Adicionar</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
