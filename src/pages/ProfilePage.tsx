import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import {
  graphProfileEventsMock,
  getGraphProfileStats,
  mergeGraphNodesWithAcquaintances,
} from '@/data/mockData';
import type { GraphEventNodeData, PersonData } from '@/data/types';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface ProfilePageProps {
  onNavigateToFeed: () => void;
}

function userInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ProfileGraphBoard({
  nodes,
  onSelect,
}: {
  nodes: GraphEventNodeData[];
  onSelect: (n: GraphEventNodeData) => void;
}) {
  const cx = 160;
  const cy = 105;
  const ringR = 92;

  const positions = nodes.map((_, i) => {
    const a = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
    return { x: cx + ringR * Math.cos(a), y: cy + ringR * Math.sin(a) };
  });

  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-sm mx-auto" aria-hidden>
      {nodes.map((node, i) => {
        const p = positions[i];
        const r = 12 + Math.min(14, node.connectionCount * 3.5);
        const isUp = node.isUpcoming;
        const purple = node.connectionCount >= 2 && !isUp;
        const blue = node.connectionCount === 1 && !isUp;
        const fill = isUp ? 'transparent' : purple ? '#7c3aed' : blue ? '#3b82f6' : 'hsl(230, 15%, 22%)';
        const stroke = isUp ? '#6b7280' : 'rgba(255,255,255,0.15)';
        const dash = isUp ? '5 4' : undefined;
        return (
          <g key={node.id} className="cursor-pointer" onClick={() => onSelect(node)}>
            <circle
              cx={p.x}
              cy={p.y}
              r={r + 6}
              fill="transparent"
              className="transition-transform hover:scale-105"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill={fill}
              stroke={stroke}
              strokeWidth={isUp ? 2 : 1.5}
              strokeDasharray={dash}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize={node.shortLabel.length > 5 ? 9 : 11}
              fontWeight="600"
            >
              {node.shortLabel}
            </text>
          </g>
        );
      })}
      {/* faint edges between nodes */}
      {nodes.map((_, i) => {
        const a = positions[i];
        const b = positions[(i + 1) % nodes.length];
        return (
          <line
            key={`e-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

export default function ProfilePage({ onNavigateToFeed }: ProfilePageProps) {
  const { isAuthenticated, userName, userRole } = useAuth();
  const { eventAcquaintances } = useAppState();
  const [sheetNode, setSheetNode] = useState<GraphEventNodeData | null>(null);

  const mergedNodes = useMemo(
    () => mergeGraphNodesWithAcquaintances(graphProfileEventsMock, eventAcquaintances),
    [eventAcquaintances],
  );

  const stats = useMemo(() => getGraphProfileStats(mergedNodes), [mergedNodes]);

  const connections = useMemo(() => {
    const people = new Map<string, PersonData>();
    mergedNodes.forEach((n) => {
      n.people.forEach((p) => {
        if (!p.isPlaceholder) people.set(p.id, p);
      });
    });
    return Array.from(people.values()).slice(0, 12);
  }, [mergedNodes]);

  const hasConnections = connections.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-5">Профиль</h1>
        <div className="flex flex-col items-center py-12 animate-fade-up">
          <div className="w-52 h-52 rounded-full border-2 border-dashed border-muted flex items-center justify-center bg-card/40">
            <span className="text-5xl text-muted-foreground font-light">?</span>
          </div>
          <p className="text-foreground font-medium mb-1 mt-6">Твой граф пока пуст</p>
          <p className="text-sm text-muted-foreground mb-6">Сходи на первое событие</p>
          <button
            onClick={onNavigateToFeed}
            className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 flex items-center gap-2 active:scale-[0.97] transition-transform"
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
      <div className="glass rounded-xl p-5 animate-fade-up border border-white/5">
        <div className="flex flex-col items-center">
          <ProfileGraphBoard nodes={mergedNodes} onSelect={(n) => setSheetNode(n)} />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {stats.attended} события · {stats.connections} знакомств · {stats.upcoming} предстоящих
          </p>
          <h2 className="text-xl font-bold text-foreground mt-4">{userName}</h2>
          <p className="text-sm text-muted-foreground mb-1">{userRole}</p>
          {!hasConnections && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Добавь связи на событиях</p>
              <button
                onClick={onNavigateToFeed}
                className="mt-3 py-2 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all"
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
            {connections.map((c) => (
              <div key={c.id} className="glass rounded-xl p-3 flex items-center gap-3 border border-white/5">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#7c3aed]/30 flex items-center justify-center text-foreground text-sm font-bold">
                    {userInitials(c.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast('Чат скоро появится')}
                  className="text-xs font-semibold text-[#7c3aed] shrink-0 active:scale-[0.97] transition-transform"
                >
                  Написать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sheet open={!!sheetNode} onOpenChange={(o) => !o && setSheetNode(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-[#1e2130] border-border [&>button]:hidden pb-8">
          {sheetNode && (
            <>
              <SheetHeader className="text-left space-y-1 pr-8">
                <SheetTitle className="text-lg">{sheetNode.fullTitle}</SheetTitle>
                <p className="text-sm text-muted-foreground">{sheetNode.dateLabel}</p>
              </SheetHeader>
              <p className="text-sm text-foreground mt-4">
                Познакомился с {sheetNode.people.length}{' '}
                {sheetNode.people.length === 1 ? 'человеком' : 'людьми'}
              </p>
              <div className="mt-4 space-y-3">
                {sheetNode.people.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt={p.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#7c3aed]/35 flex items-center justify-center text-sm font-bold">
                        {userInitials(p.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('Чат скоро появится')}
                      className="text-sm font-semibold text-[#7c3aed] shrink-0 active:scale-[0.97]"
                    >
                      Написать
                    </button>
                  </div>
                ))}
                {sheetNode.people.length === 0 && (
                  <p className="text-sm text-muted-foreground">Пока нет знакомств на этом событии</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
