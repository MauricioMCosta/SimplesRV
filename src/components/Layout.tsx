import { LucideIcon, LayoutDashboard, ListOrdered, Settings, BadgeDollarSign, Database, BookOpen, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import type { ReactNode } from 'react';
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
];

const bottomNavItems: NavItem[] = [
  { label: 'Configurações', href: '/settings', icon: Settings },
  { label: 'Manual de Uso', href: '/manual', icon: BookOpen },
  { label: 'Sobre', href: '/about', icon: Info },
];

const allNavItems = [...topNavItems, ...bottomNavItems];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-brand-sidebar text-white flex flex-col border-right border-brand-line shrink-0">
        <AppLogo />
        
        <nav className="flex-1 py-4">
          {topNavItems.map((item) => {
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
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-6 py-2.5 flex items-center gap-3 text-sm transition-all relative",
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
