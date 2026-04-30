import { cn } from '@/src/lib/utils';

interface AppLogoProps {
  className?: string;
  showBorder?: boolean;
  isCollapsed?: boolean;
}

export function AppLogo({ className, showBorder = true, isCollapsed = false }: AppLogoProps) {
  return (
    <div className={cn(
      "p-6 font-bold tracking-tight text-lg flex items-center gap-3 transition-all duration-300",
      showBorder && "border-b border-white/10",
      isCollapsed ? "px-4 justify-center" : "px-6",
      className
    )}>
      <div className="w-8 h-8 bg-black/30 text-brand-accent font-bold tracking-tight text-sm flex items-center justify-center rounded-lg border border-white/5 shrink-0">
        $RV
      </div>
      {!isCollapsed && (
        <span className="whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-1 duration-300">
          $imples<span className="text-brand-accent">RV</span>
        </span>
      )}
    </div>
  );
}
