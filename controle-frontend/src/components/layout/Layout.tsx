import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import "../../styles/global.css";

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isEmployeeLogin = location.pathname === '/login-funcionario';
  const isGarcom = location.pathname.startsWith('/garcom');
  const isCozinha = location.pathname === '/cozinha';
  const isEntregas = location.pathname === '/minhas-entregas';

  const { isImpersonating, revertImpersonation, activeLoja } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  if (isLoginPage) {
    return <main style={{ minHeight: '100vh', width: '100%', display: 'block', margin: 0, padding: 0 }}>{children}</main>;
  }

  if (isEmployeeLogin || isGarcom || isCozinha || isEntregas) {
     return <main style={{ minHeight: '100vh', width: '100%', display: 'block', margin: 0, padding: 0 }}>{children}</main>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 overflow-x-hidden">
      {isImpersonating && (
        <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-4 z-50">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Você está acessando como <strong>{activeLoja?.nome || 'Lojista'}</strong> (Super Admin).</span>
          </div>
          <button 
            onClick={revertImpersonation}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-xs font-bold uppercase tracking-wider"
          >
            Voltar ao Admin
          </button>
        </div>
      )}
      <Header onMobileMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
