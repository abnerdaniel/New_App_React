import { Routes, Route, Navigate } from 'react-router-dom'
import { PessoasPage } from '../pages/Pessoas/PessoasPage'
import { CategoriasPage } from '../pages/Categorias/CategoriasPage'
import { TransacoesPage } from '../pages/Transacoes/TransacoesPage'
import { TotaisPage } from '../pages/TotaisPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pessoas" />} />
      <Route path="/pessoas" element={<PessoasPage />} />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/transacoes" element={<TransacoesPage />} />
      <Route path="/totais" element={<TotaisPage />} />
    </Routes>
  );
}
