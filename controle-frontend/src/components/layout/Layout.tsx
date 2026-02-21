import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import "../../styles/global.css"

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


  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  if (isLoginPage) {
    return <main style={{ minHeight: '100vh', width: '100%', display: 'block', margin: 0, padding: 0 }}>{children}</main>;
  }

  if (isEmployeeLogin || isGarcom || isCozinha || isEntregas) {
     return <main style={{ minHeight: '100vh', width: '100%', display: 'block', margin: 0, padding: 0 }}>{children}</main>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 overflow-x-hidden">
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
