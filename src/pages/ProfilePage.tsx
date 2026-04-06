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

/** Разные радиусы орбит, узлы вперемешку по кольцам — визуально как планетарная система */
function computePlanetaryLayout(
  nodeCount: number,
  cx: number,
  cy: number,
): { positions: { x: number; y: number }[]; radii: number[] } {
  if (nodeCount === 0) return { positions: [], radii: [] };
  const orbitCount = nodeCount <= 3 ? Math.min(2, nodeCount) : Math.min(3, Math.ceil(nodeCount / 2));
  const radii =
    orbitCount === 1 ? [72] : orbitCount === 2 ? [50, 88] : [42, 70, 98];
  const orbitOf = (i: number) => i % orbitCount;
  const positions: { x: number; y: number }[] = new Array(nodeCount);

  for (let o = 0; o < orbitCount; o++) {
    const idx: number[] = [];
    for (let i = 0; i < nodeCount; i++) if (orbitOf(i) === o) idx.push(i);
    const r = radii[o];
    const k = idx.length;
    const phase = o * 0.48 + 0.15;
    idx.forEach((nodeIdx, j) => {
      const angle = (j / k) * 2 * Math.PI - Math.PI / 2 + phase;
      positions[nodeIdx] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }
  return { positions, radii };
}

function ProfileGraphBoard({
  nodes,
  onSelect,
}: {
  nodes: ProfileGraphNode[];
  onSelect: (n: ProfileGraphNode) => void;
}) {
  const cx = 160;
  const cy = 126;
  const { positions, radii } = computePlanetaryLayout(nodes.length, cx, cy);

  const rel = (p: { x: number; y: number }) => ({ x: p.x - cx, y: p.y - cy });

  return (
    <div
      className="relative w-full max-w-sm mx-auto rounded-[1.75rem] p-[10px] pt-7 pb-6 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{
        background:
          'linear-gradient(165deg, rgba(88, 28, 135, 0.14) 0%, rgba(15, 23, 42, 0.92) 42%, rgba(15, 118, 110, 0.08) 100%)',
      }}
      role="img"
      aria-label="Планетарная диаграмма: вы в центре, события и места на орбитах"
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.35), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-[-20%] h-44 w-[70%] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(20,184,166,0.28), transparent 72%)' }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] ring-1 ring-inset ring-white/[0.08]" />
      <p className="relative z-[2] text-center text-[11px] font-medium uppercase tracking-[0.18em] text-white/38 mb-0.5">
        Планетарная система связей
      </p>
      <p className="relative z-[2] text-center text-[10px] text-white/28 mb-1">
        ты в центре — события и места на разных орбитах
      </p>
      <svg
        viewBox="0 0 320 264"
        className="relative z-[1] w-full h-auto block font-sans antialiased"
      >
        <defs>
          <radialGradient id="pg-sun-corona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(254,243,199,0.55)" />
            <stop offset="45%" stopColor="rgba(251,191,36,0.22)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </radialGradient>
          <radialGradient id="pg-sun-body" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="40%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          <filter id="pg-sun-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="pg-place" cx="32%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="55%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
          <radialGradient id="pg-ev-purple" cx="28%" cy="22%" r="78%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="45%" stopColor="#7c3aed" />
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
            <stop offset="0%" stopColor="rgba(255,255,255,0.11)" />
            <stop offset="100%" stopColor="rgba(30,41,59,0.35)" />
          </radialGradient>
          <filter id="pg-node-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.5" />
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#7c3aed" floodOpacity="0.12" />
          </filter>
          <filter id="pg-node-shadow-teal" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.45" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#14b8a6" floodOpacity="0.18" />
          </filter>
        </defs>

        {radii.map((orbR, ri) => (
          <circle
            key={`orbit-${orbR}-${ri}`}
            cx={cx}
            cy={cy}
            r={orbR}
            fill="none"
            stroke="rgba(255,255,255,0.088)"
            strokeWidth="1"
            strokeDasharray="3 12"
            strokeLinecap="round"
          />
        ))}

        <circle cx={cx} cy={cy} r={30} fill="url(#pg-sun-corona)" opacity={0.5} />
        <circle
          cx={cx}
          cy={cy}
          r={15}
          fill="url(#pg-sun-body)"
          filter="url(#pg-sun-glow)"
          className="animate-graph-hub-pulse"
        />
        <circle cx={cx} cy={cy} r={5.5} fill="#fffef9" opacity={0.92} />
        <text
          x={cx}
          y={cy + 40}
          textAnchor="middle"
          fill="rgba(255,255,255,0.32)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="0.2em"
        >
          ТЫ
        </text>

        <g transform={`translate(${cx} ${cy})`}>
          <g className="animate-planetary-system-spin">
            {nodes.length >= 2 &&
              nodes.map((_, i) => {
              const a = rel(positions[i]);
              const b = rel(positions[(i + 1) % nodes.length]);
              const na = nodes[i];
              const nb = nodes[(i + 1) % nodes.length];
              const pa = isPlaceGraphNode(na);
              const pb = isPlaceGraphNode(nb);
              const placeEdge = pa || pb;
              const naEv = !pa ? na : null;
              const nbEv = !pb ? nb : null;
              const fast =
                naEv && nbEv
                  ? purpleLike(naEv) || purpleLike(nbEv)
                  : placeEdge || !!(naEv && purpleLike(naEv)) || !!(nbEv && purpleLike(nbEv));
              const subtle = naEv?.isUpcoming && nbEv?.isUpcoming;
              const stroke = subtle
                ? 'rgba(255,255,255,0.1)'
                : placeEdge
                  ? 'rgba(45,212,191,0.55)'
                  : 'rgba(167,139,250,0.5)';
              const glowStroke = subtle
                ? 'rgba(255,255,255,0.04)'
                : placeEdge
                  ? 'rgba(20,184,166,0.22)'
                  : 'rgba(124,58,237,0.2)';
              const sw = subtle ? 1 : 1.35;
              const glowW = subtle ? 2.5 : 5;
              const march = subtle ? 'graph-edge-march-slow' : fast ? 'graph-edge-march-fast' : 'graph-edge-march-slow';
              const op = subtle ? 0.55 : 0.92;
              return (
                <g key={`e-${i}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={glowStroke}
                    strokeWidth={glowW}
                    strokeLinecap="round"
                    strokeDasharray={subtle ? '3 8' : '6 9'}
                    strokeDashoffset={0}
                    className={march}
                    style={{ opacity: op * 0.85 }}
                  />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeLinecap="round"
                    strokeDasharray={subtle ? '3 8' : '6 9'}
                    strokeDashoffset={0}
                    className={march}
                    style={{ opacity: op }}
                  />
                </g>
              );
            })}

            {nodes.map((node, i) => {
              const p = rel(positions[i]);
              const dur = 2 + (i % 3) * 0.35;
              if (isPlaceGraphNode(node)) {
                const r = 10 + Math.min(12, node.visitCount * 1.1 + node.people.length * 2);
                return (
                  <g
                    key={node.id}
                    transform={`translate(${p.x} ${p.y})`}
                    className="cursor-pointer outline-none transition-[filter] duration-200 hover:brightness-125 focus-visible:brightness-125"
                    onClick={() => onSelect(node)}
                  >
                    <g className="animate-planetary-system-spin-counter">
                      <g
                        className="animate-graph-node-breathe"
                        filter="url(#pg-node-shadow-teal)"
                        style={
                          {
                            '--breathe-delay': `${i * 0.45}s`,
                            '--breathe-dur': `${dur}s`,
                          } as CSSProperties
                        }
                      >
                        <polygon points={hexPoints(r + 6)} fill="transparent" />
                        <polygon
                          points={hexPoints(r + 1.2)}
                          fill="none"
                          stroke="rgba(255,255,255,0.35)"
                          strokeWidth="0.9"
                          opacity={0.85}
                        />
                        <polygon
                          points={hexPoints(r)}
                          fill="url(#pg-place)"
                          stroke="rgba(167,243,208,0.5)"
                          strokeWidth="1.6"
                        />
                        <text
                          x={0}
                          y={4}
                          textAnchor="middle"
                          fill="white"
                          fontSize={node.shortLabel.length > 5 ? 7.5 : 9}
                          fontWeight="600"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
                        >
                          {node.shortLabel}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              }
              const r = 11 + Math.min(13, node.connectionCount * 3.5);
              const isUp = node.isUpcoming;
              const purple = node.connectionCount >= 2 && !isUp;
              const blue = node.connectionCount === 1 && !isUp;
              const fillId = isUp
                ? 'url(#pg-upcoming-fill)'
                : purple
                  ? 'url(#pg-ev-purple)'
                  : blue
                    ? 'url(#pg-ev-blue)'
                    : 'url(#pg-ev-muted)';
              const stroke = isUp ? 'rgba(148,163,184,0.65)' : 'rgba(255,255,255,0.28)';
              const dash = isUp ? '5 4' : undefined;
              return (
                <g
                  key={node.id}
                  transform={`translate(${p.x} ${p.y})`}
                  className="cursor-pointer outline-none transition-[filter] duration-200 hover:brightness-125 focus-visible:brightness-125"
                  onClick={() => onSelect(node)}
                >
                  <g className="animate-planetary-system-spin-counter">
                    <g
                      className="animate-graph-node-breathe"
                      filter="url(#pg-node-shadow)"
                      style={
                        {
                          '--breathe-delay': `${i * 0.45}s`,
                          '--breathe-dur': `${dur}s`,
                        } as CSSProperties
                      }
                    >
                      <circle cx={0} cy={0} r={r + 6} fill="transparent" />
                      {!isUp && (
                        <circle
                          cx={0}
                          cy={0}
                          r={r + 2.2}
                          fill="none"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="0.85"
                        />
                      )}
                      <circle
                        cx={0}
                        cy={0}
                        r={r}
                        fill={fillId}
                        stroke={stroke}
                        strokeWidth={isUp ? 2 : 1.6}
                        strokeDasharray={dash}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="white"
                        fontSize={node.shortLabel.length > 5 ? 8 : 10}
                        fontWeight="600"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
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
    </div>
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
              <li className="text-white/40 pb-0.5">
                Ты в центре; пунктирные кольца — орбиты. Узлы крутятся медленно, подписи остаются ровными.
              </li>
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
