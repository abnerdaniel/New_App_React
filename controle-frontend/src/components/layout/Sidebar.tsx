import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li>
          <Link to="/pessoas">Pessoas</Link>
        </li>
        <li>
          <Link to="/categorias">Categorias</Link>
        </li>
        <li>
          <Link to="/transacoes">Transações</Link>
        </li>
        <li>
          <Link to="/totais">Totais</Link>
        </li>
      </ul>
    </aside>
  );
}
