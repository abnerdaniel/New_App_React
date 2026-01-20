import type { ReactNode } from 'react';
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import "../../styles/global.css"

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
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
