import { Routes, Route, Navigate } from 'react-router-dom'
import { CategoriasPage } from '../pages/Categorias/CategoriasPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { EmployeeLoginPage } from '../pages/Auth/EmployeeLoginPage'

import { SetupCompany } from '../pages/Setup/SetupCompany'
import { SetupEmployee } from '../pages/Setup/SetupEmployee'
import { StoreList } from '../pages/Setup/StoreList'
import { PrivateRoute } from '../components/auth/PrivateRoute'

// New Pages
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { MesasPage } from '../pages/Mesas/MesasPage'
import { PDVPage } from '../pages/PDV/PDVPage'
import { DeliveryPage } from '../pages/Delivery/DeliveryPage'
import { CardapioPage } from '../pages/Cardapio/CardapioPage'
import { CardapioDetalhes } from '../pages/Cardapio/CardapioDetalhes'
import { EstoquePage } from '../pages/Estoque/EstoquePage'
import { FinanceiroPage } from '../pages/Financeiro/FinanceiroPage'
import { VitrinePage } from '../pages/Vitrine/VitrinePage'
import { MonitorPedidos } from '../pages/Pedidos/MonitorPedidos'
import { GarcomPage } from '../pages/Garcom/GarcomPage'
import { WaiterOrderPage } from '../pages/Garcom/WaiterOrderPage'
import { CozinhaPage } from '../pages/Cozinha/CozinhaPage'
import { MinhasEntregasPage } from '../pages/Motoboy/MinhasEntregasPage'
import { SuperAdminLojas } from '../pages/SuperAdmin/SuperAdminLojas'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-funcionario" element={<EmployeeLoginPage />} />
      
      {/* Standalone Employee Apps */}
      <Route path="/garcom" element={<GarcomPage />} />
      <Route path="/garcom/pedido" element={<WaiterOrderPage />} />
      <Route path="/cozinha" element={<CozinhaPage />} />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/vitrine/:lojaId" element={<VitrinePage />} />
      
      {/* Setup & Management */}
      <Route path="/setup" element={<PrivateRoute><SetupCompany /></PrivateRoute>} />
      <Route path="/manage-stores" element={<PrivateRoute><StoreList /></PrivateRoute>} />
      <Route path="/setup-employee" element={<PrivateRoute><SetupEmployee /></PrivateRoute>} />
      
      {/* Super Admin */}
      <Route path="/superadmin/lojas" element={<PrivateRoute><SuperAdminLojas /></PrivateRoute>} />

      {/* Main Modules */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/mesas" element={<PrivateRoute><MesasPage /></PrivateRoute>} />
      <Route path="/pdv" element={<PrivateRoute><PDVPage /></PrivateRoute>} />
      <Route path="/delivery" element={<PrivateRoute><DeliveryPage /></PrivateRoute>} />
      <Route path="/cardapio" element={<PrivateRoute><CardapioPage /></PrivateRoute>} />
      <Route path="/cardapio/:id/detalhes" element={<PrivateRoute><CardapioDetalhes /></PrivateRoute>} />
      <Route path="/estoque" element={<PrivateRoute><EstoquePage /></PrivateRoute>} />
      <Route path="/monitor-pedidos" element={<PrivateRoute><MonitorPedidos /></PrivateRoute>} />
      <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
      <Route path="/financeiro" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
      <Route path="/minhas-entregas" element={<MinhasEntregasPage />} />

      {/* Legacy/Specific */}
      <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
    </Routes>
  );
}
