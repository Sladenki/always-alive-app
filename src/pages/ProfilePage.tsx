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
import { Search, Lock, Unlock, Eye, CalendarPlus, Sparkles, Users, Star, MessageCircle, Route, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect, type CSSProperties } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useCountUp } from '@/hooks/useCountUp';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  getSavedDayRoutes,
  removeSavedDayRoute,
  SAVED_DAYS_UPDATED_EVENT,
  type SavedDayRouteEntry,
} from '@/lib/savedDayRoutes';

interface ProfilePageProps {
  onNavigateToFeed: () => void;
  privacyMode?: import('@/components/OnboardingFlow').PrivacyMode;
  onPrivacyChange?: (m: import('@/components/OnboardingFlow').PrivacyMode) => void;
}

/* ─── Level system ─── */

interface GraphLevel {
  level: number;
  title: string;
  emoji: string;
  minPoints: number;
  gradient: string;
  unlock: string;
  unlockIcon: typeof Eye;
}

const LEVELS: GraphLevel[] = [
  { level: 1, title: 'Новичок', emoji: '🌱', minPoints: 0,
    gradient: 'linear-gradient(135deg, hsl(160 60% 22%), hsl(160 70% 38%))',
    unlock: 'Базовый профиль и лента', unlockIcon: Users },
  { level: 2, title: 'Знакомый', emoji: '🤝', minPoints: 3,
    gradient: 'linear-gradient(135deg, hsl(200 60% 25%), hsl(200 75% 48%))',
    unlock: 'Видишь кто идёт на события', unlockIcon: Users },
  { level: 3, title: 'Свой человек', emoji: '👁', minPoints: 7,
    gradient: 'linear-gradient(135deg, hsl(263 60% 30%), hsl(263 70% 55%))',
    unlock: 'Кто смотрел твой профиль', unlockIcon: Eye },
  { level: 4, title: 'Связной', emoji: '⚡', minPoints: 12,
    gradient: 'linear-gradient(135deg, hsl(35 60% 28%), hsl(35 80% 50%))',
    unlock: 'Приоритет в подборе', unlockIcon: Sparkles },
  { level: 5, title: 'Организатор', emoji: '🚀', minPoints: 18,
    gradient: 'linear-gradient(135deg, hsl(340 60% 30%), hsl(340 75% 50%))',
    unlock: 'Создавай свои события', unlockIcon: CalendarPlus },
];

function getLevel(pts: number) {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pts >= LEVELS[i].minPoints) { idx = i; break; }
  }
  const current = LEVELS[idx];
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const progress = next
    ? Math.min(100, ((pts - current.minPoints) / (next.minPoints - current.minPoints)) * 100)
    : 100;
  return { current, next, progress };
}

function computePoints(s: { connectionsUnique: number; eventsAndPlaces: number }) {
  return s.connectionsUnique + Math.floor(s.eventsAndPlaces * 0.5);
}

function userInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function hexPoints(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function computePlanetaryLayout(count: number, cx: number, cy: number) {
  if (count === 0) return { positions: [] as { x: number; y: number }[], radii: [] as number[] };
  const orbCount = count <= 3 ? Math.min(2, count) : Math.min(3, Math.ceil(count / 2));
  const radii = orbCount === 1 ? [72] : orbCount === 2 ? [50, 88] : [42, 70, 98];
  const positions = new Array<{ x: number; y: number }>(count);
  for (let o = 0; o < orbCount; o++) {
    const idx: number[] = [];
    for (let i = 0; i < count; i++) if (i % orbCount === o) idx.push(i);
    const r = radii[o];
    const phase = o * 0.48 + 0.15;
    idx.forEach((ni, j) => {
      const angle = (j / idx.length) * 2 * Math.PI - Math.PI / 2 + phase;
      positions[ni] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }
  return { positions, radii };
}

/* ─── Graph Board ─── */
function ProfileGraph({ nodes, onSelect }: { nodes: ProfileGraphNode[]; onSelect: (n: ProfileGraphNode) => void }) {
  const cx = 160, cy = 130;
  const { positions, radii } = computePlanetaryLayout(nodes.length, cx, cy);
  const rel = (p: { x: number; y: number }) => ({ x: p.x - cx, y: p.y - cy });

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass">
      {/* Ambient */}
      <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-[90%] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, hsl(var(--violet) / 0.4), transparent 70%)' }} />

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-4 pb-1 px-3">
        {[
          { color: 'bg-violet', label: 'Событие', shape: 'rounded-full' },
          { color: 'bg-teal', label: 'Место', shape: 'rounded-sm' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn('w-2 h-2 inline-block', l.color, l.shape)} />
            {l.label}
          </span>
        ))}
      </div>

      <svg viewBox="0 0 320 268" className="relative z-[1] w-full h-auto block font-sans">
        <defs>
          <radialGradient id="pg-sun" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="40%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          <filter id="pg-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="pg-place" cx="32%" cy="28%" r="75%">
            <stop offset="0%" stopColor="hsl(168 60% 75%)" />
            <stop offset="100%" stopColor="hsl(168 76% 30%)" />
          </radialGradient>
          <radialGradient id="pg-ev-hi" cx="28%" cy="22%" r="78%">
            <stop offset="0%" stopColor="hsl(263 60% 80%)" />
            <stop offset="100%" stopColor="hsl(263 70% 35%)" />
          </radialGradient>
          <radialGradient id="pg-ev-lo" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="hsl(220 50% 70%)" />
            <stop offset="100%" stopColor="hsl(220 60% 35%)" />
          </radialGradient>
          <radialGradient id="pg-ev-muted" cx="40%" cy="35%" r="68%">
            <stop offset="0%" stopColor="hsl(220 10% 45%)" />
            <stop offset="100%" stopColor="hsl(228 18% 14%)" />
          </radialGradient>
          <filter id="pg-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        {radii.map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke="hsl(var(--foreground) / 0.04)" strokeWidth="1" strokeDasharray="4 10" />
        ))}

        <circle cx={cx} cy={cy} r={22} fill="hsl(var(--primary) / 0.08)" />
        <circle cx={cx} cy={cy} r={12} fill="url(#pg-sun)" filter="url(#pg-glow)" className="animate-graph-hub-pulse" />
        <circle cx={cx} cy={cy} r={4.5} fill="#fffef9" opacity={0.85} />
        <text x={cx} y={cy + 32} textAnchor="middle" fill="hsl(var(--foreground) / 0.35)" fontSize="11" fontWeight="600" letterSpacing="0.12em">ТЫ</text>

        <g transform={`translate(${cx} ${cy})`}>
          <g className="animate-planetary-system-spin">
            {nodes.length >= 2 && nodes.map((_, i) => {
              const a = rel(positions[i]);
              const b = rel(positions[(i + 1) % nodes.length]);
              const na = nodes[i], nb = nodes[(i + 1) % nodes.length];
              const pa = isPlaceGraphNode(na), pb = isPlaceGraphNode(nb);
              const naEv = !pa ? na as GraphEventNodeData : null;
              const nbEv = !pb ? nb as GraphEventNodeData : null;
              const subtle = naEv?.isUpcoming && nbEv?.isUpcoming;
              const stroke = subtle ? 'hsl(var(--foreground) / 0.06)' : pa || pb ? 'hsl(var(--teal) / 0.35)' : 'hsl(var(--violet) / 0.3)';
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={stroke} strokeWidth={subtle ? 0.7 : 1}
                  strokeLinecap="round" strokeDasharray={subtle ? '3 8' : '5 8'}
                  className={subtle ? 'graph-edge-march-slow' : 'graph-edge-march-fast'}
                  style={{ opacity: subtle ? 0.4 : 0.7 }} />
              );
            })}

            {nodes.map((node, i) => {
              const p = rel(positions[i]);
              const dur = 2 + (i % 3) * 0.3;
              if (isPlaceGraphNode(node)) {
                const r = 10 + Math.min(10, node.visitCount * 0.8 + node.people.length * 1.5);
                return (
                  <g key={node.id} transform={`translate(${p.x} ${p.y})`}
                    className="cursor-pointer hover:brightness-125 transition-[filter]"
                    onClick={() => onSelect(node)}>
                    <g className="animate-planetary-system-spin-counter">
                      <g className="animate-graph-node-breathe" filter="url(#pg-shadow)"
                        style={{ '--breathe-delay': `${i * 0.45}s`, '--breathe-dur': `${dur}s` } as CSSProperties}>
                        <polygon points={hexPoints(r)} fill="url(#pg-place)" stroke="hsl(var(--teal) / 0.3)" strokeWidth="1.2" />
                        <text x={0} y={3.5} textAnchor="middle" fill="white"
                          fontSize={11} fontWeight="600"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                          {node.shortLabel.length > 7 ? `${node.shortLabel.slice(0, 6)}…` : node.shortLabel}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              }
              const evNode = node as GraphEventNodeData;
              const r = 10 + Math.min(11, evNode.connectionCount * 3);
              const isUp = evNode.isUpcoming;
              const fillId = isUp ? 'url(#pg-ev-muted)' : evNode.connectionCount >= 2 ? 'url(#pg-ev-hi)' : evNode.connectionCount >= 1 ? 'url(#pg-ev-lo)' : 'url(#pg-ev-muted)';
              return (
                <g key={node.id} transform={`translate(${p.x} ${p.y})`}
                  className="cursor-pointer hover:brightness-125 transition-[filter]"
                  onClick={() => onSelect(node)}>
                  <g className="animate-planetary-system-spin-counter">
                    <g className="animate-graph-node-breathe" filter="url(#pg-shadow)"
                      style={{ '--breathe-delay': `${i * 0.45}s`, '--breathe-dur': `${dur}s` } as CSSProperties}>
                      <circle cx={0} cy={0} r={r} fill={fillId}
                        stroke={isUp ? 'hsl(var(--foreground) / 0.15)' : 'hsl(var(--foreground) / 0.1)'}
                        strokeWidth={isUp ? 1.2 : 1} strokeDasharray={isUp ? '4 3' : undefined} />
                      <text x={0} y={3.5} textAnchor="middle" fill="white"
                        fontSize={11} fontWeight="600"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                        {evNode.shortLabel.length > 8 ? `${evNode.shortLabel.slice(0, 7)}…` : evNode.shortLabel}
                      </text>
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <p className="text-center text-[11px] text-muted-foreground/50 pb-3">Нажми на узел</p>
    </div>
  );
}

/* ─── Main ─── */
export default function ProfilePage({ onNavigateToFeed, privacyMode = 'observer', onPrivacyChange }: ProfilePageProps) {
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
    mergedNodes.forEach((n) => n.people.forEach((p) => { if (!p.isPlaceholder) people.set(p.id, p); }));
    return Array.from(people.values()).slice(0, 12);
  }, [mergedNodes]);

  const points = computePoints(stats);
  const levelInfo = getLevel(points);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 17 ? 'Добрый день' : hour < 23 ? 'Добрый вечер' : 'Доброй ночи';

  const statEventsPlaces = useCountUp(stats.eventsAndPlaces, 800, isAuthenticated);
  const statConnections = useCountUp(stats.connectionsUnique, 800, isAuthenticated);

  const [savedDayRoutes, setSavedDayRoutes] = useState<SavedDayRouteEntry[]>(() => getSavedDayRoutes());
  useEffect(() => {
    const sync = () => setSavedDayRoutes(getSavedDayRoutes());
    sync();
    window.addEventListener(SAVED_DAYS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SAVED_DAYS_UPDATED_EVENT, sync);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Профиль</h1>
        <div className="flex flex-col items-center py-14 animate-fade-up">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-breathe" />
            <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-muted flex items-center justify-center bg-card/30">
              <span className="text-4xl text-muted-foreground font-light">?</span>
            </div>
          </div>
          <p className="text-foreground font-semibold mb-1 mt-8">Твой граф пока пуст</p>
          <p className="text-sm text-muted-foreground mb-8 text-center max-w-[260px]">
            Сходи на первое событие и начни строить сеть связей
          </p>
          <button type="button" onClick={onNavigateToFeed}
            className="py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_hsl(var(--primary)/0.25)]">
            <Search className="w-4 h-4" />
            Найти событие →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="rounded-2xl glass p-5 animate-fade-up">
        <p className="text-[13px] text-muted-foreground mb-3">{greeting}</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-foreground shrink-0 shadow-lg"
            style={{ background: levelInfo.current.gradient }}>
            {userInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-medium text-foreground truncate leading-snug">{userName}</h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed mt-0.5">{userRole}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-foreground shadow-md"
            style={{ background: levelInfo.current.gradient }}>
            <span>{levelInfo.current.emoji}</span>
            <span>{levelInfo.current.title}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[15px] text-muted-foreground leading-relaxed px-1">
        <span className="font-semibold tabular-nums text-foreground">{statEventsPlaces}</span> событий и мест ·{' '}
        <span className="font-semibold tabular-nums text-foreground">{statConnections}</span> знакомств
      </p>

      {/* Сохранённые маршруты «Мой день» */}
      {savedDayRoutes.length > 0 && (
        <section className="rounded-2xl glass p-4 space-y-3 animate-fade-up">
          <h3 className="text-[15px] font-medium text-foreground flex items-center gap-2">
            <Route className="w-4 h-4 text-teal" />
            Сохранённые маршруты дня
          </h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Маршруты из карты («Мой день» → «Сохранить день»), только на этом устройстве.
          </p>
          <div className="space-y-2">
            {savedDayRoutes.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-white/[0.06] bg-foreground/[0.02] p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{entry.dateLabelRu}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {entry.stopCount} {entry.stopCount === 1 ? 'точка' : entry.stopCount < 5 ? 'точки' : 'точек'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Удалить запись"
                    onClick={() => {
                      removeSavedDayRoute(entry.id);
                      toast('Запись удалена');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entry.stops.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/20 px-2 py-1 text-[11px] text-foreground/90"
                    >
                      <span>{s.icon}</span>
                      <span className="truncate max-w-[140px]">{s.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Level progress */}
      <div className="rounded-2xl glass p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Прогресс</span>
          <span className="text-xs text-muted-foreground tabular-nums">{points} очков</span>
        </div>
        {levelInfo.next ? (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">До «{levelInfo.next.title}»</span>
                <span className="text-foreground font-medium tabular-nums">{levelInfo.next.minPoints - points} ост.</span>
              </div>
              <Progress value={levelInfo.progress} className="h-1.5 bg-secondary" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span><span className="text-foreground/80 font-medium">Ур. {levelInfo.next.level}:</span> {levelInfo.next.unlock}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Star className="w-3.5 h-3.5" />
            <span className="font-medium">Максимальный уровень!</span>
          </div>
        )}
      </div>

      {/* Graph */}
      <section className="space-y-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-[15px] font-medium text-foreground leading-snug">🌐 Граф связей</h2>
        <ProfileGraph nodes={mergedNodes} onSelect={setSheetNode} />
      </section>

      {/* Unlocks */}
      <div className="rounded-2xl glass p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Разблокировки
        </h3>
        <div className="space-y-2">
          {LEVELS.map((lvl) => {
            const unlocked = levelInfo.current.level >= lvl.level;
            const Icon = lvl.unlockIcon;
            return (
              <div key={lvl.level} className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                unlocked ? 'bg-foreground/[0.03]' : 'opacity-40',
              )}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: unlocked ? lvl.gradient : 'hsl(var(--secondary))' }}>
                  {unlocked ? <Unlock className="w-3.5 h-3.5 text-foreground" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{lvl.emoji} {lvl.title}</span>
                    {unlocked && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">✓</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Icon className="w-3 h-3 shrink-0" />{lvl.unlock}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connections */}
      {connections.length > 0 && (
        <section className="space-y-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Твои связи
            <span className="text-xs text-muted-foreground font-normal ml-auto">{connections.length}</span>
          </h3>
          <div className="space-y-1.5">
            {connections.map((c) => (
              <div key={c.id} className="rounded-2xl glass glass-hover p-3 flex items-center gap-3 transition-all">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-border" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-violet/15 flex items-center justify-center text-foreground text-sm font-bold">
                    {userInitials(c.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-[13px] text-muted-foreground truncate">{c.role}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-[13px] font-semibold text-primary px-3 py-2 rounded-xl border border-primary/35 active:scale-[0.96] transition-transform"
                  onClick={() => toast('Чат скоро будет здесь')}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Написать
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {connections.length === 0 && (
        <div className="rounded-2xl glass p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">Ходи на события — связи появятся</p>
          <button type="button" onClick={onNavigateToFeed}
            className="py-3 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-95 shadow-[0_4px_16px_hsl(var(--primary)/0.2)]">
            Найти событие →
          </button>
        </div>
      )}

      {/* Sheet */}
      <Sheet open={!!sheetNode} onOpenChange={(o) => !o && setSheetNode(null)}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-3xl glass-solid border-border pb-8">
          {sheetNode && isPlaceGraphNode(sheetNode) && (
            <>
              <SheetHeader className="text-left space-y-1 pr-8">
                <SheetTitle className="text-lg">{sheetNode.fullTitle}</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-teal mt-3">
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
                      <div className="w-10 h-10 rounded-full bg-teal/15 flex items-center justify-center text-sm font-bold">{userInitials(p.name)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
                  </div>
                ))}
                {sheetNode.people.length === 0 && <p className="text-sm text-muted-foreground">Пока никого</p>}
              </div>
            </>
          )}
          {sheetNode && !isPlaceGraphNode(sheetNode) && (
            <>
              <SheetHeader className="text-left space-y-1 pr-8">
                <SheetTitle className="text-lg">{(sheetNode as GraphEventNodeData).fullTitle}</SheetTitle>
                <p className="text-sm text-muted-foreground">{(sheetNode as GraphEventNodeData).dateLabel}</p>
              </SheetHeader>
              <p className="text-sm text-foreground mt-4">
                Познакомился с {sheetNode.people.length} {sheetNode.people.length === 1 ? 'человеком' : 'людьми'}
              </p>
              <div className="mt-4 space-y-3">
                {sheetNode.people.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet/15 flex items-center justify-center text-sm font-bold">{userInitials(p.name)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
                  </div>
                ))}
                {sheetNode.people.length === 0 && <p className="text-sm text-muted-foreground">Пока нет знакомств</p>}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
