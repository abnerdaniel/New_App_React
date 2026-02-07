import { Star, Clock } from 'lucide-react';
import type { Loja } from '../types';

interface StoreCardProps {
  loja: Loja;
  onClick: (id: string) => void;
}

export function StoreCard({ loja, onClick }: StoreCardProps) {
  return (
    <div 
      onClick={() => onClick(loja.id)}
      className={`cursor-pointer group flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${!loja.aberto ? 'opacity-75 grayscale' : ''}`}
    >
      <div className="h-40 bg-gray-200 overflow-hidden relative">
        <img 
            src={loja.bannerUrl || loja.imagemUrl} 
            alt={loja.nome} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            loading="lazy"
        />
        {!loja.aberto && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wider border-2 border-white px-3 py-1 rounded">FECHADO</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{loja.nome}</h3>
          {loja.avaliacao !== undefined && (
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span>{loja.avaliacao}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{loja.categoria} • {loja.descricao}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{loja.tempoEntregaMin}-{loja.tempoEntregaMax} min</span>
            </div>
            <span>•</span>
            <span className={loja.taxaEntrega === 0 ? 'text-green-600 font-medium' : ''}>
                {loja.taxaEntrega === 0 ? 'Grátis' : `R$ ${loja.taxaEntrega.toFixed(2).replace('.', ',')}`}
            </span>
        </div>
      </div>
    </div>
  );
}
