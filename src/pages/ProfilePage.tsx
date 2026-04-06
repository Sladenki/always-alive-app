import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';

interface ProfilePageProps {
  onNavigateToFeed: () => void;
}

export default function ProfilePage({ onNavigateToFeed }: ProfilePageProps) {
  const { isAuthenticated, userName, userRole, requestAuth } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-5">Профиль</h1>
        <div className="flex flex-col items-center py-12 animate-fade-up">
          {/* Graph with single pulsing node */}
          <div className="relative w-48 h-48 mb-6">
            {/* Connection lines (faded) */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute top-1/2 left-1/2 w-20 h-px bg-border/30 origin-left"
                style={{ transform: `rotate(${deg}deg)` }}
              />
            ))}
            {/* Center node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse-glow">
              <span className="text-primary font-bold text-lg">?</span>
            </div>
            {/* Ghost nodes */}
            {[
              { x: 0, y: -60 },
              { x: 52, y: -30 },
              { x: 52, y: 30 },
              { x: 0, y: 60 },
              { x: -52, y: 30 },
              { x: -52, y: -30 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-muted border border-border/50"
                style={{ top: `calc(50% + ${pos.y}px - 12px)`, left: `calc(50% + ${pos.x}px - 12px)` }}
              />
            ))}
          </div>
          <p className="text-foreground font-medium mb-1">Твой граф пока пуст</p>
          <p className="text-sm text-muted-foreground mb-6">Сходи на первое событие</p>
          <button
            onClick={onNavigateToFeed}
            className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Найти первое событие →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">Профиль</h1>
      <div className="glass rounded-xl p-6 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
          <span className="text-primary font-bold text-2xl">{userName[0]}</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">{userName}</h2>
        <p className="text-sm text-muted-foreground">{userRole}</p>
      </div>
    </div>
  );
}
