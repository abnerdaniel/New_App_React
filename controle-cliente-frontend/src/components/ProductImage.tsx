import { useState } from 'react';
import { 
  Hamburger, 
  CupSoda, 
  UtensilsCrossed, 
  Pizza, 
  IceCream, 
  PartyPopper,
  Package,
  Utensils,
  Star
} from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  productType?: string;
  isCombo?: boolean;
}

export function ProductImage({ src, alt, className, productType = '', isCombo = false }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const getFallbackIcon = () => {
    const size = "w-1/2 h-1/2"; // Relative size to container
    const color = "text-gray-400";
    const strokeWidth = 1.5;

    if (isCombo) return <Package className={`${size} ${color}`} strokeWidth={strokeWidth} />;

    // Use productType only. Do NOT fallback to categoryName to avoid misleading icons.
    // If productType is missing, it will return the default icon.
    // Normalize text: remove accents and lowercase
    const textToMatch = productType || '';
    
    const normalizedCategory = textToMatch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "");

    // Backend Types: Pratos, Lanches, PorcoesPetiscos, Bebidas, Sobremesas, Adicionais, Combos, Infantil, Especiais
    
    //console.log(`Tipo: ${normalizedCategory}`); 
    // Lanches
    if (normalizedCategory.includes('lanches')) {
      return <Hamburger className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }
    
    // Bebidas
    if (normalizedCategory.includes('bebidas') || normalizedCategory.includes('refrigerante') || normalizedCategory.includes('suco')) {
      return <CupSoda className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Pratos
    if (normalizedCategory.includes('pratos')) {
      return <Utensils className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Porções/Petiscos
    if (normalizedCategory.includes('porcoes') || normalizedCategory.includes('petiscos')) {
      return <UtensilsCrossed className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Sobremesas
    if (normalizedCategory.includes('sobremesas') || normalizedCategory.includes('doces') || normalizedCategory.includes('sorvetes')) {
      return <IceCream className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Infantil
    if (normalizedCategory.includes('infantil') || normalizedCategory.includes('kids')) {
      return <PartyPopper className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Especiais
    if (normalizedCategory.includes('especial')) {
      return <Star className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Combos
    if (normalizedCategory.includes('combo')) {
      return <Package className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Adicionais
    if (normalizedCategory.includes('adicionais')) {
       return <UtensilsCrossed className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Pizza
    if (normalizedCategory.includes('pizza')) {
      return <Pizza className={`${size} ${color}`} strokeWidth={strokeWidth} />;
    }

    // Default icon
    return <Utensils className={`${size} ${color}`} strokeWidth={strokeWidth} />;
  };

  if (!src || hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gray-100 rounded-md border border-gray-200`}
        aria-label={alt}
        role="img"
      >
        {getFallbackIcon()}
      </div>
    );
  }

  return (
    <img 
      key={src} // Reset error state on src change
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
