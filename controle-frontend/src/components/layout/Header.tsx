import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <h1>App New Control</h1>
      {user && (
        <div className="header-user">
          <span>Olá, {user.nome}</span>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
