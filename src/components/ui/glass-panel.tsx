import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  strong?: boolean;
}

export function GlassPanel({ children, className, interactive = false, strong = false }: GlassPanelProps) {
  return (
    <div
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-2xl border-white/[0.08] shadow-[0_8px_28px_rgba(6,10,20,0.35)]',
        interactive && 'glass-hover transition-all active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </div>
  );
}
