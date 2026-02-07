import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Produto } from '../types';

interface CartItem {
  produto: Produto;
  quantidade: number;
  observacao?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (produto: Produto, quantidade: number, observacao?: string) => void;
  removeItem: (produtoId: string) => void;
  updateQuantity: (produtoId: string, quantidade: number) => void;
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

  const addItem = (produto: Produto, quantidade: number, observacao?: string) => {
    setItems(current => {
      const existing = current.find(item => item.produto.id === produto.id);
      if (existing) {
        return current.map(item => 
          item.produto.id === produto.id 
            ? { ...item, quantidade: item.quantidade + quantidade, observacao: observacao || item.observacao }
            : item
        );
      }
      return [...current, { produto, quantidade, observacao }];
    });
  };

  const removeItem = (produtoId: string) => {
    setItems(current => current.filter(item => item.produto.id !== produtoId));
  };

  const updateQuantity = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(produtoId);
      return;
    }
    setItems(current => 
      current.map(item => 
        item.produto.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
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
