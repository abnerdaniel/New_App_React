import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { ProductImage } from './ProductImage';
import type { ProdutoImagem } from '../types';

interface ImageCarouselProps {
  imagens?: ProdutoImagem[];
  fallbackUrl?: string;
  produtoNome: string;
  produtoTipo?: string;
}

export function ImageCarousel({ imagens, fallbackUrl, produtoNome, produtoTipo }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Default array if there are no images explicitly in `imagens` but there is a fallbackUrl
  const allImages = (imagens && imagens.length > 0) 
    ? imagens 
    : fallbackUrl 
      ? [{ id: 0, url: fallbackUrl, ordem: 0 }] 
      : [];

  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }, 4000); // 4 seconds
    
    return () => clearInterval(interval);
  }, [allImages.length]);

  if (allImages.length === 0) {
    return (
      <ProductImage 
        alt={produtoNome} 
        className="w-full h-full object-contain"
        productType={produtoTipo}
      />
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - next image
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }
    
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right - previous image
      setCurrentIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    }
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      {/* Lightbox overlay */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          <img
            src={allImages[currentIndex].url}
            alt={`${produtoNome} - Imagem ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + allImages.length) % allImages.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % allImages.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
              >
                <ChevronRight size={28} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                {currentIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

    <div 
      className="relative w-full h-full overflow-hidden rounded-t-2xl md:rounded-t-none group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform object-contain duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {allImages.map((img, index) => (
          <div
            key={img.id || index}
            className="w-full h-full flex-shrink-0 flex items-center justify-center relative bg-gray-50 cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
             <ProductImage 
                src={img.url} 
                alt={`${produtoNome} - Imagem ${index + 1}`} 
                className="w-full h-full object-cover md:object-contain absolute"
                productType={produtoTipo}
             />
             {/* Zoom hint */}
             <div className="absolute bottom-2 right-2 bg-black/30 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <ZoomIn size={14} />
             </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows for Desktop */}
      {allImages.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/70 shadow border border-gray-100 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/70 shadow border border-gray-100 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/20 px-2 py-1 rounded-full">
            {allImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  </>);
}
