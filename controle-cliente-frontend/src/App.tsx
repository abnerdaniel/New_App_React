import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { LojaPage } from './pages/Loja';
import { CartPage } from './pages/Carrinho';
import { Identificacao } from './pages/Identificacao';
import { CheckoutPage } from './pages/CheckoutPage';

import { CartProvider } from './context/CartContext';
import { ClientAuthProvider } from './context/ClientAuthContext';

function App() {
  return (
    <ClientAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loja/:id" element={<LojaPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/identificacao" element={<Identificacao />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ClientAuthProvider>
  );
}

export default App;
