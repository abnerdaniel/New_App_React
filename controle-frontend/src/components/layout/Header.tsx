import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, Store } from "lucide-react";
import { api } from "../../api/axios";

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logout, activeLoja, selectLoja, updateActiveLoja } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const storeMenuRef = useRef<HTMLDivElement>(null);

  // Close store menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target as Node)) {
        setShowStoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleToggleStatus() {
      if (!activeLoja) return;

      const novoStatus = !activeLoja.aberta;
      
      try {
          // O backend espera status bool no body
          await api.patch(`/api/loja/${activeLoja.id}/status`, novoStatus, {
              headers: { 'Content-Type': 'application/json' }
          });
          
          updateActiveLoja({ aberta: novoStatus });
      } catch (error) {
          console.error("Erro ao atualizar status da loja", error);
          alert("Não foi possível atualizar o status da loja.");
      }
  }

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
        
        {/* Status Toggle */}
        {activeLoja && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    {activeLoja.aberta ? 'Aberta' : 'Fechada'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={activeLoja.aberta || false} 
                        onChange={handleToggleStatus}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>
        )}

        {/* Store Selector */}
        {user?.lojas && user.lojas.length > 0 && (
            <div className="relative" ref={storeMenuRef}>
                <button 
                  onClick={() => setShowStoreMenu(!showStoreMenu)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/20"
                  title="Trocar Loja"
                >
                    <Store size={16} />
                    <span className="text-sm font-semibold truncate max-w-[150px]">
                        {activeLoja?.nome || "Selecione a Loja"}
                    </span>
                    <span className="text-xs text-white/50">▼</span>
                </button>
                
                {showStoreMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-down">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                            Minhas Lojas
                        </div>
                        {user.lojas.map(loja => (
                            <button
                                key={loja.id}
                                onClick={() => { selectLoja(loja.id); setShowStoreMenu(false); }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-brand-primary/5 hover:text-brand-primary transition-colors border-b border-gray-50 flex items-center justify-between ${activeLoja?.id === loja.id ? 'font-bold text-brand-primary bg-brand-primary/5' : 'text-gray-700'}`}
                            >
                                <span className="truncate">{loja.nome}</span>
                                {activeLoja?.id === loja.id && <span className="text-brand-primary">✓</span>}
                            </button>
                        ))}
                        <button 
                            onClick={() => { navigate('/manage-stores'); setShowStoreMenu(false); }}
                            className="w-full text-center px-4 py-2 text-xs text-brand-primary font-bold hover:underline bg-gray-50"
                        >
                            Gerenciar Lojas
                        </button>
                    </div>
                )}
            </div>
        )}

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
