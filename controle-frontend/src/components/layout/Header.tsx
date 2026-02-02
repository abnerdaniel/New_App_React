import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="bg-brand-primary text-white p-4 shadow-md flex justify-between items-center z-40 relative">
      <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMobileMenuClick}
            className="md:hidden p-1 hover:bg-white/10 rounded focus:outline-none"
            title="Menu"
          >
            <Menu size={24} />
          </button>

         {/* Logo placeholder - text based for now */}
         <div className="bg-white text-brand-primary font-black text-xl w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
            L
         </div>
         <h1 className="text-xl font-bold tracking-tight">App New Control</h1>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-white text-xl p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              title="Configurações"
            >
              ⚙️
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-down">
                <button 
                  onClick={() => { navigate('/manage-stores'); setShowMenu(false); }} 
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors border-b border-gray-50"
                >
                  Gerenciar Lojas
                </button>
                <button 
                  onClick={() => { navigate('/setup-employee'); setShowMenu(false); }} 
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors border-b border-gray-50"
                >
                  Funcionários
                </button>
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 text-center uppercase tracking-wider font-semibold">
                    Gerenciar Login
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
                <span className="block text-sm font-semibold text-white">{user.nome}</span>
                <span className="block text-xs text-white/80">Administrador</span>
            </div>
            <button 
                onClick={handleLogout} 
                className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white hover:text-brand-primary transition-all border border-white/20"
            >
                Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
