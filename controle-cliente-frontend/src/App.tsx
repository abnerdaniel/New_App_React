import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Parceiros } from './pages/Parceiros';
import { LojaPage } from './pages/Loja';
import { CartPage } from './pages/Carrinho';
import { Identificacao } from './pages/Identificacao';
import { CheckoutPage } from './pages/CheckoutPage';
import { PedidoSucesso } from './pages/PedidoSucesso';
import { PedidoStatus } from './pages/PedidoStatus';
import { MeusPedidos } from './pages/MeusPedidos';
import { PerfilPage } from './pages/PerfilPage';

import { CartProvider } from './context/CartContext';
import { ClientAuthProvider } from './context/ClientAuthContext';

function App() {
  return (
    <ClientAuthProvider>
      <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/parceiros" element={<Parceiros />} />
              <Route path="/:id" element={<LojaPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/identificacao" element={<Identificacao />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pedido-sucesso/:id" element={<PedidoSucesso />} />
              <Route path="/pedido/:id" element={<PedidoStatus />} />
              <Route path="/meus-pedidos" element={<MeusPedidos />} />
              <Route path="/perfil" element={<PerfilPage />} />
            </Routes>
          </BrowserRouter>
      </CartProvider>
    </ClientAuthProvider>
  );
}

export default App;
