import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { mockEvents } from '@/data/mockData';
import { Search } from 'lucide-react';
import { useMemo } from 'react';

interface ProfilePageProps {
  onNavigateToFeed: () => void;
}

export default function ProfilePage({ onNavigateToFeed }: ProfilePageProps) {
  const { isAuthenticated, userName, userRole } = useAuth();
  const { signedUpEventIds } = useAppState();

  // Build graph nodes from people at events user signed up for
  const connections = useMemo(() => {
    const people = new Map<string, { name: string; role: string; avatarUrl?: string }>();
    mockEvents
      .filter(e => signedUpEventIds.has(e.id))
      .forEach(e => {
        e.attendees.forEach(p => {
          if (!p.isPlaceholder) people.set(p.id, { name: p.name, role: p.role, avatarUrl: p.avatarUrl });
        });
      });
    return Array.from(people.values()).slice(0, 6);
  }, [signedUpEventIds]);

  const hasConnections = connections.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-5">Профиль</h1>
        <div className="flex flex-col items-center py-12 animate-fade-up">
          <GraphVisualization centerLabel="?" connections={[]} />
          <p className="text-foreground font-medium mb-1 mt-6">Твой граф пока пуст</p>
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
      <div className="glass rounded-xl p-6 animate-fade-up">
        <div className="flex flex-col items-center">
          <GraphVisualization
            centerLabel={userName[0]}
            connections={connections}
          />
          <h2 className="text-xl font-bold text-foreground mt-4">{userName}</h2>
          <p className="text-sm text-muted-foreground mb-2">{userRole}</p>
          {hasConnections && (
            <p className="text-xs text-muted-foreground">
              {connections.length} связей · {signedUpEventIds.size} событий
            </p>
          )}
          {!hasConnections && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Твой граф пока пуст — сходи на первое событие</p>
              <button
                onClick={onNavigateToFeed}
                className="mt-3 py-2 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Найти событие →
              </button>
            </div>
          )}
        </div>
      </div>

      {hasConnections && (
        <div className="mt-4">
          <h3 className="text-foreground font-semibold mb-3">Твои связи</h3>
          <div className="space-y-2">
            {connections.map((c, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
                    {c.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GraphVisualization({ centerLabel, connections }: { centerLabel: string; connections: { name: string; avatarUrl?: string }[] }) {
  const nodePositions = [
    { x: 0, y: -70 },
    { x: 61, y: -35 },
    { x: 61, y: 35 },
    { x: 0, y: 70 },
    { x: -61, y: 35 },
    { x: -61, y: -35 },
  ];

  return (
    <div className="relative w-52 h-52">
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 208 208">
        {nodePositions.map((pos, i) => (
          <line
            key={i}
            x1="104" y1="104"
            x2={104 + pos.x} y2={104 + pos.y}
            stroke={i < connections.length ? 'hsl(35, 95%, 55%)' : 'hsl(230, 15%, 18%)'}
            strokeWidth={i < connections.length ? 1.5 : 0.5}
            opacity={i < connections.length ? 0.6 : 0.3}
          />
        ))}
      </svg>
      {/* Center node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse-glow z-10">
        <span className="text-primary font-bold text-lg">{centerLabel}</span>
      </div>
      {/* Outer nodes */}
      {nodePositions.map((pos, i) => {
        const person = connections[i];
        return (
          <div
            key={i}
            className={`absolute w-8 h-8 rounded-full overflow-hidden border ${
              person ? 'border-primary/50' : 'border-border/30 bg-muted'
            }`}
            style={{ top: `calc(50% + ${pos.y}px - 16px)`, left: `calc(50% + ${pos.x}px - 16px)` }}
          >
            {person?.avatarUrl ? (
              <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        );
      })}
    </div>
  );
}
