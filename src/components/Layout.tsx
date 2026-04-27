import { LucideIcon, LayoutDashboard, ListOrdered, Settings, BadgeDollarSign, Database, BookOpen, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Ativos', href: '/assets', icon: Database },
  { label: 'Transações', href: '/transactions', icon: ListOrdered },
  { label: 'Lucros Realizados', href: '/sells', icon: BadgeDollarSign },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-brand-sidebar text-white flex flex-col border-right border-brand-line shrink-0">
        <div className="p-6 font-bold tracking-tight text-lg flex items-center gap-2 border-b border-white/10">
          <span>$imples<span className="text-brand-accent">RV</span></span>
        </div>
        
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-6 py-3 flex items-center gap-3 text-sm transition-all relative",
                  isActive 
                    ? "text-white bg-white/5 border-l-4 border-brand-accent" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="py-4 border-t border-white/10 flex flex-col">
           <Link
             to="/manual"
             className={cn(
               "px-6 py-2.5 flex items-center gap-3 text-sm transition-all relative",
               location.pathname === '/manual' 
                 ? "text-white bg-white/5 border-l-4 border-brand-accent" 
                 : "text-slate-400 hover:text-white hover:bg-white/5"
             )}
           >
             <BookOpen size={16} />
             <span>Manual de Uso</span>
           </Link>
           <Link
             to="/about"
             className={cn(
               "px-6 py-2.5 flex items-center gap-3 text-sm transition-all relative",
               location.pathname === '/about' 
                 ? "text-white bg-white/5 border-l-4 border-brand-accent" 
                 : "text-slate-400 hover:text-white hover:bg-white/5"
             )}
           >
             <Info size={16} />
             <span>Sobre</span>
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-brand-line flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-brand-ink">
            {navItems.find(i => i.href === location.pathname)?.label || 'Visão Geral'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
               env: production | engine: dexie.js
             </div>
          </div>
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
          <div>Segurança da Persistência: Alta</div>
          <div className="font-mono">v1.2.0-stable</div>
        </footer>
      </div>
    </div>
  );
}
