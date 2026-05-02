import { LucideIcon, LayoutDashboard, ListOrdered, Settings, BadgeDollarSign, Database, BookOpen, Info, ChevronLeft, ChevronRight, FileBarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ReactNode, useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const topNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Ativos', href: '/assets', icon: Database },
  { label: 'Transações', href: '/transactions', icon: ListOrdered },
  { label: 'Lucros Realizados', href: '/sells', icon: BadgeDollarSign },
  { label: 'Relatórios', href: '/reports', icon: FileBarChart },
];

const bottomNavItems: NavItem[] = [
  { label: 'Configurações', href: '/settings', icon: Settings },
  { label: 'Manual de Uso', href: '/manual', icon: BookOpen },
  { label: 'Sobre', href: '/about', icon: Info },
];

const allNavItems = [...topNavItems, ...bottomNavItems];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse logic for screens < 1024px
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-brand-sidebar text-white flex flex-col border-r border-brand-line shrink-0 transition-all duration-300 relative",
          isCollapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        <AppLogo isCollapsed={isCollapsed} />
        
        <nav className="flex-1 py-4">
          {topNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-6 py-3 flex items-center gap-3 text-sm transition-all relative overflow-hidden group",
                  isCollapsed ? "px-0 justify-center" : "px-6",
                  isActive 
                    ? "text-white bg-white/5 border-l-4 border-brand-accent" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-brand-sidebar border border-white/10 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="py-4 border-t border-white/10 flex flex-col">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-6 py-2.5 flex items-center gap-3 text-sm transition-all relative overflow-hidden group",
                  isCollapsed ? "px-0 justify-center" : "px-6",
                  isActive 
                    ? "text-white bg-white/5 border-l-4 border-brand-accent" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} className="shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-brand-sidebar border border-white/10 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-2 mx-auto w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-brand-line flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-brand-ink">
            {allNavItems.find(i => i.href === location.pathname)?.label || 'Visão Geral'}
          </h2>
        </header>

        <main className="flex-1 overflow-auto p-8 bg-brand-bg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        
        <footer className="h-10 bg-white border-t border-brand-line flex items-center px-8 justify-between text-[11px] text-slate-400 shrink-0">
          <div className="font-mono">v1.2.0-stable</div>
        </footer>
      </div>
    </div>
  );
}
