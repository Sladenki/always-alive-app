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
import { Search, Lock, Unlock, Eye, CalendarPlus, Sparkles, Users, MapPin, ChevronRight, Star } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useCountUp } from '@/hooks/useCountUp';
import { Progress } from '@/components/ui/progress';

interface ProfilePageProps {
  onNavigateToFeed: () => void;
}

/* ─── Level system ─── */

interface GraphLevel {
  level: number;
  title: string;
  emoji: string;
  minPoints: number;
  color: string;        // tailwind text color
  bgGradient: string;   // CSS gradient for badge
  unlock: string;
  unlockIcon: typeof Eye;
}

const LEVELS: GraphLevel[] = [
  {
    level: 1, title: 'Новичок', emoji: '🌱', minPoints: 0,
    color: 'text-emerald-400', bgGradient: 'linear-gradient(135deg, #065f46, #059669)',
    unlock: 'Базовый профиль и лента событий', unlockIcon: Users,
  },
  {
    level: 2, title: 'Знакомый', emoji: '🤝', minPoints: 3,
    color: 'text-sky-400', bgGradient: 'linear-gradient(135deg, #0c4a6e, #0284c7)',
    unlock: 'Видишь кто ещё идёт на твои события', unlockIcon: Users,
  },
  {
    level: 3, title: 'Свой человек', emoji: '👁', minPoints: 7,
    color: 'text-violet-400', bgGradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
    unlock: 'Видишь кто анонимно смотрел твой профиль', unlockIcon: Eye,
  },
  {
    level: 4, title: 'Связной', emoji: '⚡', minPoints: 12,
    color: 'text-amber-400', bgGradient: 'linear-gradient(135deg, #92400e, #d97706)',
    unlock: 'Приоритет в подборе совпадений', unlockIcon: Sparkles,
  },
  {
    level: 5, title: 'Организатор', emoji: '🚀', minPoints: 18,
    color: 'text-rose-400', bgGradient: 'linear-gradient(135deg, #9f1239, #e11d48)',
    unlock: 'Можешь создавать свои события', unlockIcon: CalendarPlus,
  },
];

function getLevel(points: number): { current: GraphLevel; next: GraphLevel | null; progress: number } {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) { idx = i; break; }
  }
  const current = LEVELS[idx];
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const progress = next
    ? Math.min(100, ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100)
    : 100;
  return { current, next, progress };
}

function computePoints(stats: { connectionsUnique: number; eventsAndPlaces: number }): number {
  return stats.connectionsUnique + Math.floor(stats.eventsAndPlaces * 0.5);
}

/* ─── Helpers ─── */

function userInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
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

function computePlanetaryLayout(
  nodeCount: number,
  cx: number,
  cy: number,
): { positions: { x: number; y: number }[]; radii: number[] } {
  if (nodeCount === 0) return { positions: [], radii: [] };
  const orbitCount = nodeCount <= 3 ? Math.min(2, nodeCount) : Math.min(3, Math.ceil(nodeCount / 2));
  const radii = orbitCount === 1 ? [72] : orbitCount === 2 ? [50, 88] : [42, 70, 98];
  const positions: { x: number; y: number }[] = new Array(nodeCount);
  for (let o = 0; o < orbitCount; o++) {
    const idx: number[] = [];
    for (let i = 0; i < nodeCount; i++) if (i % orbitCount === o) idx.push(i);
    const r = radii[o];
    const phase = o * 0.48 + 0.15;
    idx.forEach((nodeIdx, j) => {
      const angle = (j / idx.length) * 2 * Math.PI - Math.PI / 2 + phase;
      positions[nodeIdx] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }
  return { positions, radii };
}

/* ─── Level Badge Component ─── */
function LevelBadge({ level }: { level: GraphLevel }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white shadow-lg"
      style={{ background: level.bgGradient }}
    >
      <span>{level.emoji}</span>
      <span>{level.title}</span>
    </div>
  );
}

/* ─── Level Progress Card ─── */
function LevelProgressCard({
  points,
  levelInfo,
}: {
  points: number;
  levelInfo: ReturnType<typeof getLevel>;
}) {
  const { current, next, progress } = levelInfo;
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <LevelBadge level={current} />
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {points} очков
        </span>
      </div>

      {next ? (
        <>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">До «{next.title}»</span>
              <span className="text-foreground font-medium tabular-nums">
                {next.minPoints - points} ост.
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span>
              <span className="text-foreground/80 font-medium">Уровень {next.level}:</span>{' '}
              {next.unlock}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <Star className="w-3.5 h-3.5" />
          <span className="font-medium">Максимальный уровень достигнут!</span>
        </div>
      )}
    </div>
  );
}

/* ─── Unlocks List ─── */
function UnlocksList({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Разблокировки по уровням
      </h3>
      <div className="space-y-2.5">
        {LEVELS.map((lvl) => {
          const unlocked = currentLevel >= lvl.level;
          const Icon = lvl.unlockIcon;
          return (
            <div
              key={lvl.level}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                unlocked
                  ? 'bg-white/[0.04]'
                  : 'bg-white/[0.02] opacity-50'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: unlocked ? lvl.bgGradient : 'hsl(var(--secondary))' }}
              >
                {unlocked ? (
                  <Unlock className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    {lvl.emoji} {lvl.title}
                  </span>
                  {unlocked && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 flex items-center gap-1">
                  <Icon className="w-3 h-3 shrink-0" />
                  {lvl.unlock}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Profile Graph (simplified + cleaner) ─── */
function ProfileGraphBoard({
  nodes,
  onSelect,
  levelColor,
}: {
  nodes: ProfileGraphNode[];
  onSelect: (n: ProfileGraphNode) => void;
  levelColor: string;
}) {
  const cx = 160;
  const cy = 130;
  const { positions, radii } = computePlanetaryLayout(nodes.length, cx, cy);
  const rel = (p: { x: number; y: number }) => ({ x: p.x - cx, y: p.y - cy });

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.06]"
      style={{
        background: 'linear-gradient(165deg, rgba(88,28,135,0.10) 0%, rgba(15,23,42,0.95) 42%, rgba(15,118,110,0.06) 100%)',
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-[110%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.3), transparent 70%)' }}
      />
      <div className="pointer-events-none absolute -bottom-16 right-[-15%] h-36 w-[60%] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(20,184,166,0.25), transparent 72%)' }}
      />

      {/* Legend chips */}
      <div className="flex justify-center gap-3 pt-4 pb-1 px-3">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Событие
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-sm bg-teal-500 inline-block" style={{clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)'}} /> Место
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full border border-muted-foreground/50 inline-block" style={{borderStyle:'dashed'}} /> Предстоит
        </span>
      </div>

      <svg viewBox="0 0 320 268" className="relative z-[1] w-full h-auto block font-sans">
        <defs>
          <radialGradient id="pg-sun-body" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="40%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          <filter id="pg-sun-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="pg-place" cx="32%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
          <radialGradient id="pg-ev-purple" cx="28%" cy="22%" r="78%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#4c1d95" />
          </radialGradient>
          <radialGradient id="pg-ev-blue" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <radialGradient id="pg-ev-muted" cx="40%" cy="35%" r="68%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <radialGradient id="pg-upcoming-fill" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(30,41,59,0.3)" />
          </radialGradient>
          <filter id="pg-node-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Orbit rings */}
        {radii.map((orbR, ri) => (
          <circle key={`orbit-${ri}`} cx={cx} cy={cy} r={orbR}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            strokeDasharray="4 10" strokeLinecap="round"
          />
        ))}

        {/* Center "sun" */}
        <circle cx={cx} cy={cy} r={26} fill="rgba(254,243,199,0.12)" />
        <circle cx={cx} cy={cy} r={14} fill="url(#pg-sun-body)" filter="url(#pg-sun-glow)"
          className="animate-graph-hub-pulse" />
        <circle cx={cx} cy={cy} r={5} fill="#fffef9" opacity={0.9} />
        <text x={cx} y={cy + 36} textAnchor="middle" fill="rgba(255,255,255,0.25)"
          fontSize="8" fontWeight="700" letterSpacing="0.18em">ТЫ</text>

        {/* Nodes */}
        <g transform={`translate(${cx} ${cy})`}>
          <g className="animate-planetary-system-spin">
            {/* Edges */}
            {nodes.length >= 2 && nodes.map((_, i) => {
              const a = rel(positions[i]);
              const b = rel(positions[(i + 1) % nodes.length]);
              const na = nodes[i];
              const nb = nodes[(i + 1) % nodes.length];
              const pa = isPlaceGraphNode(na);
              const pb = isPlaceGraphNode(nb);
              const naEv = !pa ? na : null;
              const nbEv = !pb ? nb : null;
              const subtle = naEv?.isUpcoming && nbEv?.isUpcoming;
              const placeEdge = pa || pb;
              const stroke = subtle ? 'rgba(255,255,255,0.08)' : placeEdge ? 'rgba(45,212,191,0.45)' : 'rgba(167,139,250,0.4)';
              return (
                <line key={`e-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={stroke} strokeWidth={subtle ? 0.8 : 1.2}
                  strokeLinecap="round" strokeDasharray={subtle ? '3 8' : '5 8'}
                  className={subtle ? 'graph-edge-march-slow' : 'graph-edge-march-fast'}
                  style={{ opacity: subtle ? 0.5 : 0.85 }}
                />
              );
            })}

            {/* Node circles/hexagons */}
            {nodes.map((node, i) => {
              const p = rel(positions[i]);
              const dur = 2 + (i % 3) * 0.35;
              if (isPlaceGraphNode(node)) {
                const r = 10 + Math.min(10, node.visitCount * 0.8 + node.people.length * 1.5);
                return (
                  <g key={node.id} transform={`translate(${p.x} ${p.y})`}
                    className="cursor-pointer hover:brightness-125 transition-[filter]"
                    onClick={() => onSelect(node)}>
                    <g className="animate-planetary-system-spin-counter">
                      <g className="animate-graph-node-breathe" filter="url(#pg-node-shadow)"
                        style={{ '--breathe-delay': `${i * 0.45}s`, '--breathe-dur': `${dur}s` } as CSSProperties}>
                        <polygon points={hexPoints(r)} fill="url(#pg-place)" stroke="rgba(167,243,208,0.4)" strokeWidth="1.4" />
                        <text x={0} y={3.5} textAnchor="middle" fill="white"
                          fontSize={node.shortLabel.length > 6 ? 7 : 8.5} fontWeight="600"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          {node.shortLabel}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              }
              const r = 10 + Math.min(11, node.connectionCount * 3);
              const isUp = node.isUpcoming;
              const purple = node.connectionCount >= 2 && !isUp;
              const fillId = isUp ? 'url(#pg-upcoming-fill)' : purple ? 'url(#pg-ev-purple)' : node.connectionCount >= 1 ? 'url(#pg-ev-blue)' : 'url(#pg-ev-muted)';
              return (
                <g key={node.id} transform={`translate(${p.x} ${p.y})`}
                  className="cursor-pointer hover:brightness-125 transition-[filter]"
                  onClick={() => onSelect(node)}>
                  <g className="animate-planetary-system-spin-counter">
                    <g className="animate-graph-node-breathe" filter="url(#pg-node-shadow)"
                      style={{ '--breathe-delay': `${i * 0.45}s`, '--breathe-dur': `${dur}s` } as CSSProperties}>
                      <circle cx={0} cy={0} r={r} fill={fillId}
                        stroke={isUp ? 'rgba(148,163,184,0.5)' : 'rgba(255,255,255,0.2)'}
                        strokeWidth={isUp ? 1.5 : 1.2} strokeDasharray={isUp ? '4 3' : undefined} />
                      <text x={0} y={3.5} textAnchor="middle" fill="white"
                        fontSize={node.shortLabel.length > 6 ? 7.5 : 9} fontWeight="600"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {node.shortLabel}
                      </text>
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Tap hint */}
      <p className="text-center text-[10px] text-muted-foreground/50 pb-3">
        Нажми на узел чтобы увидеть детали
      </p>
    </div>
  );
}

/* ─── Stats Row ─── */
function StatsRow({ stats, isAuth }: { stats: ReturnType<typeof getCombinedGraphStats>; isAuth: boolean }) {
  const spots = useCountUp(stats.eventsAndPlaces, 800, isAuth);
  const conn = useCountUp(stats.connectionsUnique, 800, isAuth);
  const up = useCountUp(stats.upcoming, 800, isAuth);
  const items = [
    { label: 'Точек', value: spots, icon: MapPin },
    { label: 'Связей', value: conn, icon: Users },
    { label: 'Впереди', value: up, icon: CalendarPlus },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-white/[0.06] bg-card/50 p-3 text-center">
          <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold text-foreground tabular-nums">{s.value}</p>
          <p className="text-[10px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
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

  const connections = useMemo(() => {
    const people = new Map<string, PersonData>();
    mergedNodes.forEach((n) => {
      n.people.forEach((p) => { if (!p.isPlaceholder) people.set(p.id, p); });
    });
    return Array.from(people.values()).slice(0, 12);
  }, [mergedNodes]);

  const points = computePoints(stats);
  const levelInfo = getLevel(points);

  /* ─── Not authenticated ─── */
  if (!isAuthenticated) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-5">Профиль</h1>
        <div className="flex flex-col items-center py-12 animate-fade-up">
          <div className="w-40 h-40 rounded-full border-2 border-dashed border-muted flex items-center justify-center bg-card/40 animate-graph-hub-pulse">
            <span className="text-4xl text-muted-foreground font-light">?</span>
          </div>
          <p className="text-foreground font-semibold mb-1 mt-6">Твой граф пока пуст</p>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-[260px]">
            Сходи на первое событие и начни строить свою сеть связей
          </p>
          <button type="button" onClick={onNavigateToFeed}
            className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 flex items-center gap-2 transition-[transform,filter] duration-150 active:scale-[0.96]">
            <Search className="w-4 h-4" />
            Найти первое событие →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-sm p-5 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: levelInfo.current.bgGradient }}>
            {userInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{userName}</h1>
            <p className="text-sm text-muted-foreground">{userRole}</p>
          </div>
          <LevelBadge level={levelInfo.current} />
        </div>
      </div>

      {/* Stats */}
      <StatsRow stats={stats} isAuth={isAuthenticated} />

      {/* Level progress */}
      <LevelProgressCard points={points} levelInfo={levelInfo} />

      {/* Graph */}
      <div className="space-y-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          🌐 Твой граф связей
        </h2>
        <ProfileGraphBoard
          nodes={mergedNodes}
          onSelect={(n) => setSheetNode(n)}
          levelColor={levelInfo.current.color}
        />
      </div>

      {/* Unlocks */}
      <UnlocksList currentLevel={levelInfo.current.level} />

      {/* Connections */}
      {connections.length > 0 && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Твои связи
            <span className="text-xs text-muted-foreground font-normal ml-auto">{connections.length}</span>
          </h3>
          <div className="space-y-1.5">
            {connections.map((c, i) => (
              <div key={c.id}
                className="rounded-xl border border-white/[0.04] bg-card/40 p-3 flex items-center gap-3 hover:bg-card/60 transition-colors"
                style={{ animationDelay: `${i * 0.05}s` }}>
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-violet-500/25 flex items-center justify-center text-foreground text-sm font-bold">
                    {userInitials(c.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {connections.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-card/50 p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">Ходи на события — связи появятся сами</p>
          <button type="button" onClick={onNavigateToFeed}
            className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-[transform,filter] duration-150 active:scale-[0.96]">
            Найти событие →
          </button>
        </div>
      )}

      {/* Node detail sheet */}
      <Sheet open={!!sheetNode} onOpenChange={(o) => !o && setSheetNode(null)}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl bg-card border-border pb-8">
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
                      <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-500/25 flex items-center justify-center text-sm font-bold">{userInitials(p.name)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
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
                      <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-500/25 flex items-center justify-center text-sm font-bold">{userInitials(p.name)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
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
