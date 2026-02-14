import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { LojaPage } from './pages/Loja';
import { CartPage } from './pages/Carrinho';
import { Identificacao } from './pages/Identificacao';
import { CheckoutPage } from './pages/CheckoutPage';
import { PedidoSucesso } from './pages/PedidoSucesso';
import { PedidoStatus } from './pages/PedidoStatus';
import { MeusPedidos } from './pages/MeusPedidos';

import { CartProvider } from './context/CartContext';
import { ClientAuthProvider } from './context/ClientAuthContext';

import { WaiterProvider } from './context/WaiterContext';
import { GarcomPage } from './pages/Garcom/GarcomPage';

function App() {
  return (
    <ClientAuthProvider>
      <CartProvider>
        <WaiterProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/garcom" element={<GarcomPage />} />
              <Route path="/loja/:id" element={<LojaPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/identificacao" element={<Identificacao />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pedido-sucesso/:id" element={<PedidoSucesso />} />
              <Route path="/pedido/:id" element={<PedidoStatus />} />
              <Route path="/meus-pedidos" element={<MeusPedidos />} />
            </Routes>
          </BrowserRouter>
        </WaiterProvider>
      </CartProvider>
    </ClientAuthProvider>
  );
}

export default App;
