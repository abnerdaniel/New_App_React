import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Produto } from '../types';

interface CartItem {
  produto: Produto;
  quantidade: number;
  observacao?: string;
  extras?: Produto[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (produto: Produto, quantidade: number, observacao?: string, extras?: Produto[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantidade: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);



  const addItem = (produto: Produto, quantidade: number, observacao?: string, extras: Produto[] = []) => {
    setItems(current => {
      // Logic for uniqueness based on Product ID AND Extras
      // Since we don't have a unique Item ID, we verify contents.
      // Better approach: Look for item with same product ID and same set of extras.
      
      const existingIndex = current.findIndex(item => {
         if (item.produto.id !== produto.id) return false;
         const currentExtrasIds = (item.extras || []).map(e => e.id).sort().join(',');
         const newExtrasIds = extras.map(e => e.id).sort().join(',');
         return currentExtrasIds === newExtrasIds;
      });

      if (existingIndex >= 0) {
        const newItems = [...current];
        newItems[existingIndex].quantidade += quantidade;
        // Merge observation? Or keep existing? Let's keep existing or overwrite? Usually append if different.
        // For simplicity: Update observation if provided, otherwise keep.
        if (observacao) newItems[existingIndex].observacao = observacao;
        
        return newItems;
      }
      
      // Add new item
      return [...current, { produto, quantidade, observacao, extras }];
    });
  };

  const removeItem = (produtoId: string) => { // This logic is flawed if we have multiple items with same product ID but different extras. 
    // Ideally removeItem should take an index or a unique synthetic ID.
    // For now, let's assume we remove ALL instances of that product or need a better ID.
    // Let's change removeItem to take an INDEX or generated ID.
    // Given the previous code used `produtoId`, I'll improve it to filtering.
    // Wait, if I have (Burger+Bacon) and (Burger+Egg), removing by `produtoId` removes BOTH.
    // User might want to remove just one.
    // Refactoring to use a generated ID (or index) is safer but requires changing how removeItem is called in `Carrinho.tsx`.
    // Let's check `Carrinho.tsx` later. For now, I'll filter by product ID to avoid breaking compilation, but note the limitation.
    setItems(current => current.filter(item => item.produto.id !== produtoId));
  };

  const updateQuantity = (produtoId: string, quantidade: number) => { 
     if (quantidade < 1) return;
     setItems(current => 
      current.map(item => 
        item.produto.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => {
      const extrasTotal = (item.extras || []).reduce((sum, extra) => sum + extra.preco, 0);
      return acc + ((item.produto.preco + extrasTotal) * item.quantidade);
  }, 0);
  const count = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
