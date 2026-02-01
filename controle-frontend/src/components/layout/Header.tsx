import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <h1>App New Control</h1>
      {user && (
        <div className="header-user">
          <div style={{ position: 'relative', display: 'inline-block', marginRight: '15px' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              title="Configurações"
            >
              ⚙️
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <button onClick={() => { navigate('/manage-stores'); setShowMenu(false); }} style={{ padding: '10px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                  Gerenciar Lojas
                </button>
                <button onClick={() => { navigate('/setup-employee'); setShowMenu(false); }} style={{ padding: '10px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                  Funcionários
                </button>
                <div style={{ padding: '10px', color: '#ccc', fontSize: '0.8rem' }}>Gerenciar Login</div>
              </div>
            )}
          </div>
          <span>Olá, {user.nome}</span>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
