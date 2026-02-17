import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  HandPlatter, 
  Bike, 
  UtensilsCrossed, 
  Store, 
  Package, 
  DollarSign, 
  Settings,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: HandPlatter, label: "Controle de Mesas", path: "/mesas" },
    { icon: Store, label: "PDV / Balcão", path: "/pdv" },
    { icon: Bike, label: "Controle de Delivery", path: "/delivery" },
    { icon: UtensilsCrossed, label: "Cardápio", path: "/cardapio" },
    { icon: Package, label: "Inventário", path: "/estoque" },
    { icon: DollarSign, label: "Faturamento", path: "/financeiro" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Toggle function specifically for Desktop (width control)
  // The parent passes 'onClose' which sets open=false
  // But on Desktop, we want to Toggle. If parent only provides 'onClose', we might need 'toggle' from parent.
  // Actually, Layout passes 'setSidebarOpen(false)' as onClose.
  // We need to ask parent to Toggle.
  // Wait, Layout passes "onClose={() => setSidebarOpen(false)}".
  // This means Sidebar component strictly speaking can only CLOSE. 
  // Modifying logic: If isOpen=true, onClose -> false. 
  // If isOpen=false, we can't open it via onClose.
  // The user wants a button ON THE SIDEBAR to open/close it.
  // If Sidebar is w-0, the button is on the edge.
  // We need a way to call "setSidebarOpen(!open)".
  // I should update the Prop Interface or assume onClose handles toggle? No, onClose implies closing.
  // I'll assume I need to update Layout first to pass a Toggle function or setOpen.
  // However, for this step, I'll temporarily use onClose to TOGGLE if I can't change Layout interface yet?
  // No, I must update Layout interface to pass `onToggle` or `setSidebarOpen`.

  // Let's assume for this specific file, I will just call onClose() when open
  // BUT if closed, I can't open it.
  // So I need to update the Interface.
  // I will check if I can modify Layout in same turn? Yes.
  
  // Wait, I will use a different approach. The Layout passes `onClose` which is `setSidebarOpen(false)`.
  // I will update SidebarProps to take `toggleSidebar: () => void` instead of `onClose`?
  // Or just `setOpen`.
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={onClose} 
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-[100] bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out md:transition-all
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-0 md:border-none"}
          flex flex-col
          md:overflow-visible
        `}
      >
         {/* Toggle Button - Desktop Only */}
         <button
            onClick={onToggle} 
            className="hidden md:flex absolute -right-3 top-8 bg-brand-primary border border-brand-primary rounded-full p-1 shadow-md text-white hover:bg-brand-hover cursor-pointer z-50 items-center justify-center w-6 h-6 transition-transform hover:scale-110"
            title={isOpen ? "Recolher Menu" : "Expandir Menu"}
         >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
         </button>

        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? "w-64 opacity-100" : "w-0 opacity-0"}`}>
             <div className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => { if(window.innerWidth < 768) onClose() }} 
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
                        onClick={() => { if(window.innerWidth < 768) onClose() }}
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
                        onClick={() => { if(window.innerWidth < 768) onClose() }}
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
            </div>
        </div>
      </aside>
    </>
  );
}
