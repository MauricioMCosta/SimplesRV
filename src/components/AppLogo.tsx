import { cn } from '@/src/lib/utils';

interface AppLogoProps {
  className?: string;
  showBorder?: boolean;
}

export function AppLogo({ className, showBorder = true }: AppLogoProps) {
  return (
    <div className={cn(
      "p-6 font-bold tracking-tight text-lg flex items-center gap-3",
      showBorder && "border-b border-white/10",
      className
    )}>
      <div className="w-8 h-8 bg-black/30 text-brand-accent font-bold tracking-tight text-sm flex items-center justify-center rounded-lg border border-white/5">
        $RV
      </div>
      <span>$imples<span className="text-brand-accent">RV</span></span>
    </div>
  );
}
