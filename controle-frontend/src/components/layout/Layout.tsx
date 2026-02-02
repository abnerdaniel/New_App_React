import type { ReactNode } from 'react';
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

  if (isLoginPage) {
    return <main className="page-content-full">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
