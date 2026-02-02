import { useState, ReactNode } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <main className="page-content-full">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onMobileMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
