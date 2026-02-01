import { Routes, Route, Navigate } from 'react-router-dom'
import { CategoriasPage } from '../pages/Categorias/CategoriasPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { SetupCompany } from '../pages/Setup/SetupCompany'
import { SetupEmployee } from '../pages/Setup/SetupEmployee'
import { StoreList } from '../pages/Setup/StoreList'
import { PrivateRoute } from '../components/auth/PrivateRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/categorias" />} />
      <Route path="/setup" element={<PrivateRoute><SetupCompany /></PrivateRoute>} />
      <Route path="/manage-stores" element={<PrivateRoute><StoreList /></PrivateRoute>} />
      <Route path="/setup-employee" element={<PrivateRoute><SetupEmployee /></PrivateRoute>} />
      <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
    </Routes>
  );
}
