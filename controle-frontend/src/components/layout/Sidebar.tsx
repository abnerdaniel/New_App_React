import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  HandPlatter, 
  Bike, 
  UtensilsCrossed, 
  Package, 
  DollarSign, 
  Settings,
  Users
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: HandPlatter, label: "Controle de Mesas", path: "/mesas" },
    { icon: Bike, label: "Controle de Delivery", path: "/delivery" },
    { icon: UtensilsCrossed, label: "Cardápio", path: "/cardapio" },
    { icon: Package, label: "Inventário", path: "/estoque" },
    { icon: DollarSign, label: "Faturamento", path: "/financeiro" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose} 
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:transform-none
          flex flex-col py-6
        `}
      >
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose()} // Close on click (mobile UX)
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-100">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configurações</p>
              <Link
                  to="/setup-employee"
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/setup-employee')
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                  <Users size={20} />
                  Gerenciar Equipe
              </Link>
              <Link
                  to="/manage-stores"
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/manage-stores')
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                  <Settings size={20} />
                  Minhas Lojas
              </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
