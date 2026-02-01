import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li>
          <Link to="/categorias">Categorias</Link>
        </li>
      </ul>
    </aside>
  );
}
