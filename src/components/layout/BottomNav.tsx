import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Receipt, Wrench, User } from "lucide-react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'inicio', icon: Home, label: 'Inicio', path: '/' },
    { id: 'pagar', icon: Receipt, label: 'Pagar recibos', path: '#' },
    { id: 'soporte', icon: Wrench, label: 'Soporte', path: '#' },
    { id: 'perfil', icon: User, label: 'Mi perfil', path: '#' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl">
      <div className="container mx-auto max-w-md px-2">
        <div className="flex justify-between items-center py-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.id) || (item.id === 'inicio' && location.pathname.includes('/seguimiento'));
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className="flex-1 flex flex-col items-center justify-center p-2 gap-1 relative"
              >
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[11px] font-bold tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                  {item.label}
                </span>
                
                {/* Active Indicator dot */}
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-1 w-12 h-1 bg-primary rounded-b-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* iOS Home indicator line simulation */}
        <div className="w-full flex justify-center pb-2 pt-1">
          <div className="w-32 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}