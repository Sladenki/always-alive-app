import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import {
  graphProfileEventsMock,
  graphProfilePlacesMock,
  mergeGraphNodesWithAcquaintances,
  mergePlaceGraphWithAcquaintances,
  buildCombinedProfileNodes,
  getCombinedGraphStats,
  isPlaceGraphNode,
} from '@/data/mockData';
import type { GraphEventNodeData, PersonData, ProfileGraphNode } from '@/data/types';
import { Search } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useCountUp } from '@/hooks/useCountUp';

interface ProfilePageProps {
  onNavigateToFeed: () => void;
}

function userInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function timeGreeting(name: string): string {
  const h = new Date().getHours();
  const n = name.trim() || 'друг';
  if (h >= 6 && h < 12) return `Доброе утро, ${n} ☀️`;
  if (h >= 12 && h < 18) return `Привет, ${n}`;
  return `Добрый вечер, ${n} 🌙`;
}

function purpleLike(n: GraphEventNodeData): boolean {
  return n.connectionCount >= 2 && !n.isUpcoming;
}

function hexPoints(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function ProfileGraphBoard({
  nodes,
  onSelect,
}: {
  nodes: ProfileGraphNode[];
  onSelect: (n: ProfileGraphNode) => void;
}) {
  const cx = 160;
  const cy = 105;
  const ringR = 102;

  const positions = nodes.map((_, i) => {
    const a = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
    return { x: cx + ringR * Math.cos(a), y: cy + ringR * Math.sin(a) };
  });

  return (
    <svg viewBox="0 0 320 220" className="w-full max-w-sm mx-auto" aria-hidden>
      {nodes.map((_, i) => {
        const a = positions[i];
        const b = positions[(i + 1) % nodes.length];
        const na = nodes[i];
        const nb = nodes[(i + 1) % nodes.length];
        const pa = isPlaceGraphNode(na);
        const pb = isPlaceGraphNode(nb);
        const placeEdge = pa || pb;
        const naEv = !pa ? na : null;
        const nbEv = !pb ? nb : null;
        const fast =
          naEv && nbEv ? purpleLike(naEv) || purpleLike(nbEv) : placeEdge || !!(naEv && purpleLike(naEv)) || !!(nbEv && purpleLike(nbEv));
        const subtle = naEv?.isUpcoming && nbEv?.isUpcoming;
        const stroke = subtle
          ? 'rgba(255,255,255,0.08)'
          : placeEdge
            ? 'rgba(20,184,166,0.45)'
            : 'rgba(124,58,237,0.4)';
        return (
          <line
            key={`e-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={stroke}
            strokeWidth={subtle ? 1 : 1.15}
            strokeDasharray={subtle ? '3 8' : '6 9'}
            strokeDashoffset={0}
            className={subtle ? 'graph-edge-march-slow' : fast ? 'graph-edge-march-fast' : 'graph-edge-march-slow'}
            style={{ opacity: subtle ? 0.65 : 0.95 }}
          />
        );
      })}
      {nodes.map((node, i) => {
        const p = positions[i];
        const dur = 2 + (i % 3) * 0.35;
        if (isPlaceGraphNode(node)) {
          const r = 11 + Math.min(13, node.visitCount * 1.1 + node.people.length * 2);
          const fill = '#0f766e';
          const stroke = 'rgba(45,212,191,0.85)';
          return (
            <g
              key={node.id}
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer"
              onClick={() => onSelect(node)}
            >
              <g
                className="animate-graph-node-breathe"
                style={
                  {
                    '--breathe-delay': `${i * 0.45}s`,
                    '--breathe-dur': `${dur}s`,
                  } as CSSProperties
                }
              >
                <polygon points={hexPoints(r + 5)} fill="transparent" />
                <polygon
                  points={hexPoints(r)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="white"
                  fontSize={node.shortLabel.length > 5 ? 8 : 10}
                  fontWeight="600"
                >
                  {node.shortLabel}
                </text>
              </g>
            </g>
          );
        }
        const r = 12 + Math.min(14, node.connectionCount * 3.5);
        const isUp = node.isUpcoming;
        const purple = node.connectionCount >= 2 && !isUp;
        const blue = node.connectionCount === 1 && !isUp;
        const fill = isUp ? 'transparent' : purple ? '#7c3aed' : blue ? '#3b82f6' : 'hsl(230, 15%, 22%)';
        const stroke = isUp ? '#6b7280' : 'rgba(255,255,255,0.15)';
        const dash = isUp ? '5 4' : undefined;
        return (
          <g key={node.id} transform={`translate(${p.x} ${p.y})`} className="cursor-pointer" onClick={() => onSelect(node)}>
            <g
              className="animate-graph-node-breathe"
              style={
                {
                  '--breathe-delay': `${i * 0.45}s`,
                  '--breathe-dur': `${dur}s`,
                } as CSSProperties
              }
            >
              <circle cx={0} cy={0} r={r + 6} fill="transparent" />
              <circle
                cx={0}
                cy={0}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={isUp ? 2 : 1.5}
                strokeDasharray={dash}
              />
              <text
                x={0}
                y={4}
                textAnchor="middle"
                fill="white"
                fontSize={node.shortLabel.length > 5 ? 9 : 11}
                fontWeight="600"
              >
                {node.shortLabel}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export default function ProfilePage({ onNavigateToFeed }: ProfilePageProps) {
  const { isAuthenticated, userName, userRole } = useAuth();
  const { eventAcquaintances, placeAcquaintances, placeVisitCounts } = useAppState();
  const [sheetNode, setSheetNode] = useState<ProfileGraphNode | null>(null);

  const mergedEventNodes = useMemo(
    () => mergeGraphNodesWithAcquaintances(graphProfileEventsMock, eventAcquaintances),
    [eventAcquaintances],
  );

  const mergedPlaceNodes = useMemo(
    () => mergePlaceGraphWithAcquaintances(graphProfilePlacesMock, placeAcquaintances, placeVisitCounts),
    [placeAcquaintances, placeVisitCounts],
  );

  const mergedNodes = useMemo(
    () => buildCombinedProfileNodes(mergedEventNodes, mergedPlaceNodes),
    [mergedEventNodes, mergedPlaceNodes],
  );

  const stats = useMemo(
    () => getCombinedGraphStats(mergedEventNodes, mergedPlaceNodes),
    [mergedEventNodes, mergedPlaceNodes],
  );

  const cSpots = useCountUp(stats.eventsAndPlaces, 800, isAuthenticated);
  const cConn = useCountUp(stats.connectionsUnique, 800, isAuthenticated);
  const cUp = useCountUp(stats.upcoming, 800, isAuthenticated);

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
            type="button"
            onClick={onNavigateToFeed}
            className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 flex items-center gap-2 transition-[transform,filter] duration-150 active:scale-[0.96] active:brightness-110"
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
        <p className="text-xl font-medium text-foreground text-center mb-4">{timeGreeting(userName)}</p>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-black/20 px-3 py-3 mb-3 text-left">
            <p className="text-xs font-semibold text-foreground mb-2">Как читать граф</p>
            <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-snug list-none">
              <li className="flex gap-2">
                <span className="shrink-0 min-w-[5.25rem] text-foreground/90">Круг</span>
                <span>событие по афише — уже был(а) или записан(а)</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 min-w-[5.25rem] text-teal-400/90">Шестиугольник</span>
                <span>место в городе (кафе, парк…) и люди, с кем пересеклись там</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 min-w-[5.25rem] text-[#a78bfa]/90">Линии</span>
                <span>
                  бирюзовая — связь через место; фиолетовая — сильные пересечения по событиям; пунктир —
                  оба узла — ещё предстоящие события
                </span>
              </li>
              <li className="text-white/45 pt-0.5">Тап по узлу на кольце — детали и список знакомых.</li>
            </ul>
          </div>
          <ProfileGraphBoard nodes={mergedNodes} onSelect={(n) => setSheetNode(n)} />
          <p className="text-xs text-muted-foreground mt-2 text-center leading-relaxed">
            <span className="text-foreground font-medium tabular-nums text-sm">{cSpots}</span> точек на графе
            · <span className="text-foreground font-medium tabular-nums text-sm">{cConn}</span> разных людей
            в круге · <span className="text-foreground font-medium tabular-nums text-sm">{cUp}</span>{' '}
            предстоящих событий
          </p>
          <h2 className="text-xl font-bold text-foreground mt-4">{userName}</h2>
          <p className="text-sm text-muted-foreground mb-1">{userRole}</p>
          {!hasConnections && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Добавь связи на событиях</p>
              <button
                type="button"
                onClick={onNavigateToFeed}
                className="mt-3 py-2 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-[transform,filter] duration-150 active:scale-[0.96] active:brightness-110"
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
              <div
                key={c.id}
                className="profile-connection-card glass rounded-xl p-3 flex items-center gap-3 border border-white/5 bg-card/40"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
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
                  className="text-xs font-semibold text-[#7c3aed] shrink-0 transition-[transform,filter] duration-150 active:scale-[0.96] active:brightness-110"
                >
                  Написать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sheet open={!!sheetNode} onOpenChange={(o) => !o && setSheetNode(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-2xl bg-[#1e2130] border-border pb-8"
        >
          {sheetNode && isPlaceGraphNode(sheetNode) && (
            <>
              <SheetHeader className="text-left space-y-1 pr-8">
                <SheetTitle className="text-lg">{sheetNode.fullTitle}</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-teal-400/90 mt-3">
                Ты был здесь <span className="font-semibold text-foreground">{sheetNode.visitCount}</span>{' '}
                {sheetNode.visitCount === 1 ? 'раз' : sheetNode.visitCount < 5 ? 'раза' : 'раз'}
              </p>
              <p className="text-sm text-foreground mt-4">Познакомился с:</p>
              <div className="mt-3 space-y-3">
                {sheetNode.people.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt={p.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-teal-500/30 flex items-center justify-center text-sm font-bold">
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
                      className="text-sm font-semibold text-teal-400 shrink-0 transition-[transform,filter] duration-150 active:scale-[0.96]"
                    >
                      Написать
                    </button>
                  </div>
                ))}
                {sheetNode.people.length === 0 && (
                  <p className="text-sm text-muted-foreground">Пока никого не встретил здесь</p>
                )}
              </div>
            </>
          )}
          {sheetNode && !isPlaceGraphNode(sheetNode) && (
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
                      className="text-sm font-semibold text-[#7c3aed] shrink-0 transition-[transform,filter] duration-150 active:scale-[0.96]"
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
