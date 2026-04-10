import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export default function Screen({ title, subtitle, className, children }: ScreenProps) {
  return (
    <div className={cn('pb-28 px-4 pt-4 max-w-md mx-auto', className)}>
      {(title || subtitle) && (
        <header className="mb-6">
          {title && <h1 className="text-[22px] font-medium tracking-[-0.02em] text-foreground leading-snug">{title}</h1>}
          {subtitle && <p className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
