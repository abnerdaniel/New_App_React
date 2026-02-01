import { Routes, Route, Navigate } from 'react-router-dom'
import { CategoriasPage } from '../pages/Categorias/CategoriasPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { PrivateRoute } from '../components/auth/PrivateRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/categorias" />} />
      <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
    </Routes>
  );
}
