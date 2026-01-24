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
    <div className="app-container">
      <Header />
      <div className="content-container">
        <Sidebar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
