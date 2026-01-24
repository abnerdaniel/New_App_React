import { Routes, Route, Navigate } from 'react-router-dom'
import { PessoasPage } from '../pages/Pessoas/PessoasPage'
import { CategoriasPage } from '../pages/Categorias/CategoriasPage'
import { TransacoesPage } from '../pages/Transacoes/TransacoesPage'
import { ConsultaTotaisPage } from '../pages/ConsultaTotais/TotaisPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { PrivateRoute } from '../components/auth/PrivateRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/pessoas" />} />
      <Route path="/pessoas" element={<PrivateRoute><PessoasPage /></PrivateRoute>} />
      <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
      <Route path="/transacoes" element={<PrivateRoute><TransacoesPage /></PrivateRoute>} />
      <Route path="/totais" element={<PrivateRoute><ConsultaTotaisPage /></PrivateRoute>} />
    </Routes>
  );
}
