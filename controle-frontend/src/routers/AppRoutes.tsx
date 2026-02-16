import { Routes, Route, Navigate } from 'react-router-dom'
import { CategoriasPage } from '../pages/Categorias/CategoriasPage'
import { LoginPage } from '../pages/Auth/LoginPage'

import { SetupCompany } from '../pages/Setup/SetupCompany'
import { SetupEmployee } from '../pages/Setup/SetupEmployee'
import { StoreList } from '../pages/Setup/StoreList'
import { PrivateRoute } from '../components/auth/PrivateRoute'

// New Pages
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { MesasPage } from '../pages/Mesas/MesasPage'
import { DeliveryPage } from '../pages/Delivery/DeliveryPage'
import { CardapioPage } from '../pages/Cardapio/CardapioPage'
import { CardapioDetalhes } from '../pages/Cardapio/CardapioDetalhes'
import { EstoquePage } from '../pages/Estoque/EstoquePage'
import { FinanceiroPage } from '../pages/Financeiro/FinanceiroPage'
import { VitrinePage } from '../pages/Vitrine/VitrinePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/vitrine/:lojaId" element={<VitrinePage />} />
      
      {/* Setup & Management */}
      <Route path="/setup" element={<PrivateRoute><SetupCompany /></PrivateRoute>} />
      <Route path="/manage-stores" element={<PrivateRoute><StoreList /></PrivateRoute>} />
      <Route path="/setup-employee" element={<PrivateRoute><SetupEmployee /></PrivateRoute>} />
      
      {/* Main Modules */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/mesas" element={<PrivateRoute><MesasPage /></PrivateRoute>} />
      <Route path="/delivery" element={<PrivateRoute><DeliveryPage /></PrivateRoute>} />
      <Route path="/cardapio" element={<PrivateRoute><CardapioPage /></PrivateRoute>} />
      <Route path="/cardapio/:id/detalhes" element={<PrivateRoute><CardapioDetalhes /></PrivateRoute>} />
      <Route path="/estoque" element={<PrivateRoute><EstoquePage /></PrivateRoute>} />
      <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
      <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
      
      {/* Legacy/Specific */}
      <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
    </Routes>
  );
}
