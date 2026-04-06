import { useEffect, useState } from 'react';

interface OpeningSplashProps {
  /** When false, component renders nothing */
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
    const tExit = window.setTimeout(() => setExiting(true), 600);
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
        <p className="splash-layer-logo text-3xl font-semibold tracking-tight text-foreground">Nexus</p>
        <p className="splash-layer-tagline mt-3 text-lg text-muted-foreground font-medium">Калининград живёт</p>
      </div>
    </div>
  );
}
