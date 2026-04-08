import { useEffect, useState } from 'react';

interface OpeningSplashProps {
  active: boolean;
  onComplete: () => void;
}

export default function OpeningSplash({ active, onComplete }: OpeningSplashProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!active) {
      setExiting(false);
      return;
    }
    setExiting(false);
    const tExit = window.setTimeout(() => setExiting(true), 700);
    const tDone = window.setTimeout(() => onComplete(), 1200);
    return () => {
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background pointer-events-auto"
      aria-hidden
    >
      <div className={exiting ? 'splash-layer-exit flex flex-col items-center' : 'flex flex-col items-center'}>
        {/* Ambient glow */}
        <div className="absolute w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-breathe" />
        <p className="splash-layer-logo text-4xl font-bold tracking-tight text-foreground relative">
          Nexus
        </p>
        <p className="splash-layer-tagline mt-3 text-base text-muted-foreground font-medium relative">
          Калининград живёт
        </p>
      </div>
    </div>
  );
}
