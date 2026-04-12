import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Lock, Menu, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

const BG = '#0a0a0f';
const VIOLET = '#7c3aed';
const TEAL = '#00d4aa';
const TEXT = '#F1F5F9';
const MUTED = 'rgba(241,245,249,0.55)';

/** Стоковые портреты (Unsplash) — иллюстрация кейса на лендинге. */
const NEAR_MISS_STORY = {
  place: 'Кофейня «Буфет»',
  placeDetail: 'Ленинский · среда',
  herFirstName: 'Алина',
  herHint: 'КГТУ · дизайн · джаз по вечерам',
  herPhoto:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=176&h=176&fit=crop&crop=faces&q=85',
  youPhoto:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=176&h=176&fit=crop&crop=faces&q=85',
  sheLeft: '16:28',
  youArrived: '16:40',
  gapMinutes: '12–18',
} as const;

type Dot = { x: number; y: number; kind: 'place' | 'person'; id: string };

const HERO_DOTS: Dot[] = [
  { id: '1', x: 18, y: 42, kind: 'place' },
  { id: '2', x: 28, y: 38, kind: 'person' },
  { id: '3', x: 35, y: 52, kind: 'place' },
  { id: '4', x: 42, y: 44, kind: 'person' },
  { id: '5', x: 48, y: 58, kind: 'place' },
  { id: '6', x: 55, y: 36, kind: 'person' },
  { id: '7', x: 62, y: 48, kind: 'place' },
  { id: '8', x: 70, y: 40, kind: 'person' },
  { id: '9', x: 78, y: 55, kind: 'place' },
  { id: '10', x: 22, y: 62, kind: 'person' },
  { id: '11', x: 38, y: 68, kind: 'place' },
  { id: '12', x: 52, y: 72, kind: 'person' },
  { id: '13', x: 68, y: 68, kind: 'place' },
  { id: '14', x: 85, y: 45, kind: 'person' },
  { id: '15', x: 88, y: 62, kind: 'place' },
];

function useIsMobileHero() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return mobile;
}

function nearbyPairs(dots: Dot[], maxDist: number): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i];
      const b = dots[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0 && d < maxDist) pairs.push([a.id, b.id]);
    }
  }
  return pairs;
}

function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Стилизованный силуэт: ночной Калининград — абстрактный берег и город. */
function KaliningradSilhouette() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.14]"
      viewBox="0 0 400 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="landMass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a28" />
          <stop offset="100%" stopColor="#0d0d14" />
        </linearGradient>
      </defs>
      <path
        fill="url(#landMass)"
        d="M-20 280 L40 240 L55 200 L48 165 L62 130 L95 118 L120 95 L155 88 L190 72 L230 65 L268 78 L295 95 L318 120 L340 155 L355 195 L372 230 L395 265 L420 320 L-40 320 Z"
      />
      <path
        fill="#12121c"
        opacity="0.9"
        d="M20 310 L35 255 L52 220 L70 200 L88 188 L110 182 L135 175 L165 168 L200 162 L235 170 L265 188 L288 215 L305 248 L318 290 L330 320 L15 320 Z"
      />
      <path
        fill="none"
        stroke="#2a2a3a"
        strokeWidth="0.6"
        d="M72 210 Q120 195 168 188 T280 198"
        opacity="0.5"
      />
    </svg>
  );
}

function IconFootprints() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#00d4aa]" aria-hidden>
      <path
        fill="currentColor"
        opacity="0.9"
        d="M14 8c2.5 0 4.5 2 4.5 4.5v6c0 2.5-2 4.5-4.5 4.5S9.5 21 9.5 18.5v-6C9.5 10 11.5 8 14 8zm10 4c2.2 0 4 1.8 4 4v5c0 2.2-1.8 4-4 4s-4-1.8-4-4v-5c0-2.2 1.8-4 4-4zM12 28c2 0 3.5 1.6 3.5 3.5v5c0 2-1.6 3.5-3.5 3.5S8 38.5 8 36.5v-5C8 29.6 9.6 28 12 28zm12 2c1.8 0 3.2 1.4 3.2 3.2v4.6c0 1.8-1.4 3.2-3.2 3.2-1.8 0-3.2-1.4-3.2-3.2v-4.6c0-1.8 1.4-3.2 3.2-3.2z"
      />
      <path
        fill="currentColor"
        opacity="0.45"
        d="M28 22c2.5 0 4.5 2 4.5 4.5v5c0 2.5-2 4.5-4.5 4.5S23.5 34 23.5 31.5v-5C23.5 24 25.5 22 28 22zm8-6c2.2 0 4 1.8 4 4v4.5c0 2.2-1.8 4-4 4s-4-1.8-4-4V20c0-2.2 1.8-4 4-4z"
      />
    </svg>
  );
}

function IconMoonMap() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#7c3aed]" aria-hidden>
      <path
        fill="currentColor"
        opacity="0.35"
        d="M8 36 L38 36 L38 38 L8 38 Z M10 32 L36 32"
      />
      <path
        fill="currentColor"
        d="M30 10a10 10 0 1 1-8.2 15.8 8 8 0 0 0 8.2-15.8z"
      />
      <circle cx="18" cy="22" r="2" fill="#00d4aa" opacity="0.8" />
      <circle cx="26" cy="26" r="1.5" fill="#00d4aa" opacity="0.6" />
    </svg>
  );
}

function IconAlmostLines() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden>
      <line x1="6" y1="22" x2="38" y2="22" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="30" x2="34" y2="30" stroke="#00d4aa" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <circle cx="40" cy="22" r="3" fill="#f59e0b" opacity="0.9" />
    </svg>
  );
}

function SectionNearMiss() {
  const { ref, visible } = useInViewOnce<HTMLDivElement>('0px 0px -12% 0px');
  const glowId = useId().replace(/:/g, '');
  const fomoCount = useCountUp(94, 2000, visible);

  const pinYou = { left: (50 / 400) * 100, top: (228 / 300) * 100 };
  const pinHer = { left: (338 / 400) * 100, top: (42 / 300) * 100 };
  const pulse = { left: (212 / 400) * 100, top: (96 / 300) * 100 };

  return (
    <section className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden" style={{ backgroundColor: '#06060b' }}>
      <div
        ref={ref}
        className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        <div className="order-2 lg:order-1 space-y-6 lg:space-y-8" style={{ color: TEXT }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-3">
              Реальный сценарий
            </p>
            <h2 className="text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-[-0.02em] leading-[1.12] text-[#F1F5F9]">
              Ты сел за кофе там, где{' '}
              <span className="text-amber-200/95">она была четверть часа назад</span>
            </h2>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c12]/90 p-5 sm:p-6 space-y-4 backdrop-blur-sm">
            <p className="text-sm font-semibold text-[#00d4aa]">{NEAR_MISS_STORY.place}</p>
            <p className="text-sm leading-relaxed text-slate-400">
              <span className="text-slate-200 font-medium">{NEAR_MISS_STORY.herFirstName}</span> заказала раф и сидела
              у окна до <span className="text-slate-200 tabular-nums">{NEAR_MISS_STORY.sheLeft}</span>. Ты зашёл за
              латте в <span className="text-slate-200 tabular-nums">{NEAR_MISS_STORY.youArrived}</span> — одно и то же
              место, почти соседние «окна» по времени. В реальности вы могли бы пересечься в очереди у стойки.
            </p>
            <ul className="text-[13px] leading-relaxed text-slate-500 space-y-2 border-t border-white/[0.06] pt-4">
              <li className="flex gap-2">
                <span className="text-[#7c3aed] shrink-0">→</span>
                Nexus фиксирует такие интервалы автоматически — без чек-инов и «кто здесь».
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 shrink-0">!</span>
                Пока ты не открыл день в приложении, это просто кофе. После — имя, контекст и аккуратный повод
                написать первым.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-lg sm:text-xl font-semibold tracking-tight text-[#F1F5F9]">
              <span className="tabular-nums text-amber-300">{NEAR_MISS_STORY.gapMinutes}</span> минут между вами
            </p>
            <p className="text-base leading-relaxed text-slate-400 max-w-lg">
              Сегодня похожих «почти» по городу — уже{' '}
              <span className="text-[#00d4aa] font-semibold tabular-nums">{fomoCount}</span>. Часть из них — люди
              из твоих вузов и мест.{' '}
              <span className="text-slate-300">Один из них мог сидеть за соседним столом.</span>
            </p>
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
              Nexus показывает такие совпадения только в рамках приватности — ты решаешь, идти в диалог или оставить
              как тихий сигнал дня.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative w-full max-w-[480px] mx-auto lg:max-w-none">
          <p className="text-center lg:text-left text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-3">
            {NEAR_MISS_STORY.placeDetail}
          </p>
          <div className="relative aspect-[4/3] max-h-[min(92vw,380px)] lg:max-h-[400px] rounded-2xl border border-white/[0.08] bg-[#08080f] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] overflow-visible isolate">
            <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#08080f]">
            <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden>
              <defs>
                <filter id={`${glowId}-glow`}>
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <pattern id={`${glowId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="#07070e" />
              <rect width="400" height="300" fill={`url(#${glowId}-grid)`} opacity="0.6" />
              <path
                d="M40 220 Q120 200 200 180 T360 140"
                fill="none"
                stroke="rgba(0,212,170,0.1)"
                strokeWidth="1"
              />
              <path
                d="M320 240 Q220 120 80 60"
                fill="none"
                stroke="rgba(124,58,237,0.1)"
                strokeWidth="1"
              />
              <path
                className={cn('nexus-route-path', visible && 'nexus-route-path--draw')}
                d="M50 230 C120 200 180 100 210 95"
                fill="none"
                stroke={TEAL}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                className={cn(
                  'nexus-route-path',
                  visible && 'nexus-route-path--draw nexus-route-path--draw-delay',
                )}
                d="M340 40 C280 80 240 160 215 98"
                fill="none"
                stroke={VIOLET}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle
                cx="212"
                cy="96"
                r="18"
                fill="#f59e0b"
                opacity="0.2"
                className={visible ? 'animate-nexus-amber-glow' : ''}
                style={{ transformOrigin: '212px 96px' }}
                filter={`url(#${glowId}-glow)`}
              />
              <circle cx="212" cy="96" r="6" fill="#fbbf24" opacity={visible ? 0.95 : 0} />
            </svg>
            </div>

            {/* Ты — стоковое фото, маршрут бирюзовый */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
              style={{ left: `${pinYou.left}%`, top: `${pinYou.top}%` }}
            >
              <div
                className={cn(
                  'relative rounded-full p-[2px] bg-gradient-to-br from-[#00d4aa] to-[#00d4aa]/40 shadow-[0_0_20px_-4px_rgba(0,212,170,0.6)] transition-all duration-700',
                  visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
                )}
                style={{ transitionDelay: visible ? '1.1s' : '0ms' }}
              >
                <img
                  src={NEAR_MISS_STORY.youPhoto}
                  alt=""
                  className="w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-full object-cover block"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#00d4aa] bg-black/60 px-2 py-0.5 rounded-md border border-[#00d4aa]/25">
                Ты {NEAR_MISS_STORY.youArrived}
              </span>
            </div>

            {/* Алина — стоковое фото, маршрут фиолетовый; лёгкий blur для интриги */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
              style={{ left: `${pinHer.left}%`, top: `${pinHer.top}%` }}
            >
              <div
                className={cn(
                  'relative rounded-full p-[2px] bg-gradient-to-br from-[#7c3aed] to-[#a78bfa]/50 shadow-[0_0_20px_-4px_rgba(124,58,237,0.55)] transition-all duration-700',
                  visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
                )}
                style={{ transitionDelay: visible ? '0.95s' : '0ms' }}
              >
                <img
                  src={NEAR_MISS_STORY.herPhoto}
                  alt=""
                  className="w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-full object-cover block opacity-[0.88]"
                  style={{ filter: 'blur(0.35px)' }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#c4b5fd] bg-black/60 px-2 py-0.5 rounded-md border border-[#7c3aed]/30">
                Она {NEAR_MISS_STORY.sheLeft}
              </span>
            </div>

            {/* Центр — почти-встреча */}
            <div
              className="absolute -translate-x-1/2 -translate-y-[120%] w-[min(92%,240px)] pointer-events-none"
              style={{ left: `${pulse.left}%`, top: `${pulse.top}%` }}
            >
              <div
                className={cn(
                  'rounded-xl border border-amber-500/35 bg-black/75 backdrop-blur-md px-3 py-2.5 shadow-lg transition-all duration-700',
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
                )}
                style={{ transitionDelay: visible ? '1.35s' : '0ms' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img
                      src={NEAR_MISS_STORY.herPhoto}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover opacity-55 blur-[2px]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35">
                      <Lock className="w-3.5 h-3.5 text-amber-300/90" aria-hidden />
                    </div>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[11px] font-semibold text-amber-100 leading-tight">Почти встретились</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {NEAR_MISS_STORY.herFirstName} · {NEAR_MISS_STORY.herHint}
                    </p>
                    <p className="text-[10px] text-amber-200/80 mt-1 tabular-nums">
                      разница {NEAR_MISS_STORY.gapMinutes} мин
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p
              className={cn(
                'absolute bottom-3 left-0 right-0 text-center text-[10px] text-slate-600 px-3 leading-snug transition-opacity duration-700',
                visible ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDelay: visible ? '1.6s' : '0ms' }}
            >
              Лица — стоковые фото для примера. В приложении — только согласованная приватность и твой выбор.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionGraphTeaser() {
  const { ref, visible } = useInViewOnce<HTMLDivElement>();
  const statA = useCountUp(5, 1400, visible);
  const statB = useCountUp(8, 1600, visible);
  const statC = useCountUp(2, 900, visible);

  const delays = ['0ms', '120ms', '240ms', '360ms', '500ms', '650ms', '800ms', '950ms'];

  return (
    <section ref={ref} className="py-24 px-4" style={{ backgroundColor: BG }}>
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-center" style={{ color: TEXT }}>
            Твоя жизнь в городе
          </h2>
        </ScrollReveal>

        <div
          className={cn(
            'mt-10 rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-6 sm:p-10 min-h-[280px] flex flex-col sm:flex-row gap-10 items-center justify-between',
            visible && 'nexus-graph-visible',
          )}
        >
          <div className="relative w-full max-w-[320px] aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
              <g stroke="rgba(148,163,184,0.15)" strokeWidth="0.8">
                <line x1="100" y1="100" x2="52" y2="58" />
                <line x1="100" y1="100" x2="148" y2="62" />
                <line x1="100" y1="100" x2="100" y2="154" />
                <line x1="52" y1="58" x2="148" y2="62" />
                <line x1="52" y1="58" x2="100" y2="154" />
              </g>
              <polygon
                points="52,58 58,52 64,58 64,66 58,72 52,66"
                fill={TEAL}
                className="nexus-graph-node-reveal"
                style={{ animationDelay: visible ? delays[0] : '0ms' }}
              />
              <circle
                cx="148"
                cy="62"
                r="9"
                fill={VIOLET}
                className="nexus-graph-node-reveal"
                style={{ animationDelay: visible ? delays[1] : '0ms' }}
              />
              <polygon
                points="100,154 106,148 112,154 112,162 106,168 100,162"
                fill={TEAL}
                opacity="0.85"
                className="nexus-graph-node-reveal"
                style={{ animationDelay: visible ? delays[2] : '0ms' }}
              />
              <circle
                cx="100"
                cy="100"
                r="11"
                fill={VIOLET}
                opacity="0.95"
                className="nexus-graph-node-reveal"
                style={{ animationDelay: visible ? delays[3] : '0ms' }}
              />
              <polygon
                points="140,130 146,124 152,130 152,138 146,144 140,138"
                fill={TEAL}
                opacity="0.7"
                className="nexus-graph-node-reveal"
                style={{ animationDelay: visible ? delays[4] : '0ms' }}
              />
              <circle cx="72" cy="120" r="7" fill={VIOLET} opacity="0.75" className="nexus-graph-node-reveal" style={{ animationDelay: visible ? delays[5] : '0ms' }} />
            </svg>
          </div>

          <div className="flex-1 space-y-6 text-center sm:text-left">
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: MUTED }}>
              Каждое место где ты был. Каждый человек с которым пересёкся. Граф который строится сам — просто пока ты
              живёшь.
            </p>
            <p className="text-lg font-medium tabular-nums" style={{ color: TEXT }}>
              <span className="text-[#00d4aa]">{statA}</span>
              <span style={{ color: MUTED }}> событий и мест · </span>
              <span className="text-[#7c3aed]">{statB}</span>
              <span style={{ color: MUTED }}> знакомств · </span>
              <span className="text-[#F1F5F9]">{statC}</span>
              <span style={{ color: MUTED }}> предстоящих</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionCityStats() {
  const { ref, visible } = useInViewOnce<HTMLDivElement>();
  const a = useCountUp(47, 1500, visible);
  const b = useCountUp(12, 1200, visible);
  const c = useCountUp(3, 800, visible);

  return (
    <section ref={ref} className="py-24 px-4 border-y border-white/[0.05]" style={{ backgroundColor: '#08080e' }}>
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold" style={{ color: TEXT }}>
            Калининград живёт
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-3 text-left">
          {[
            { emoji: '🔥', val: a, text: 'человек куда-то идут', prefix: 'Сегодня ' },
            { emoji: '📍', val: b, text: 'мест активны прямо сейчас', prefix: '' },
            { emoji: '🤝', val: c, text: 'пересечения случились за последний час', prefix: '' },
          ].map((row) => (
            <div
              key={row.emoji}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
            >
              <p className="text-2xl mb-2">{row.emoji}</p>
              <p className="text-sm leading-snug" style={{ color: TEXT }}>
                {row.prefix}
                <span className="font-semibold tabular-nums text-[#00d4aa]">{row.val}</span> {row.text}
              </p>
            </div>
          ))}
        </div>
        <p className="text-base max-w-md mx-auto" style={{ color: MUTED }}>
          Присоединяйся — посмотри что происходит в твоём городе сегодня
        </p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { requestAuth, startDemo } = useAuth();
  const mobileHero = useIsMobileHero();
  const uid = useId();
  const [navOpen, setNavOpen] = useState(false);

  const heroDots = useMemo(() => (mobileHero ? HERO_DOTS.slice(0, 8) : HERO_DOTS), [mobileHero]);
  const pairs = useMemo(() => nearbyPairs(heroDots, mobileHero ? 22 : 18), [heroDots, mobileHero]);

  const onTelegram = useCallback(() => {
    requestAuth('Войди через Telegram — и город начнёт складываться в граф');
  }, [requestAuth]);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden antialiased" style={{ backgroundColor: BG, color: TEXT }}>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <span className="text-lg font-semibold tracking-tight" style={{ color: TEXT }}>
            Nexus
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg border border-white/10 text-[#F1F5F9]"
              aria-label="Меню"
              onClick={() => setNavOpen((v) => !v)}
            >
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onTelegram}
              className="hidden sm:inline-flex rounded-lg border border-[#7c3aed]/70 px-4 py-2 text-sm font-semibold text-[#F1F5F9] hover:bg-[#7c3aed]/15 transition-colors"
            >
              Войти
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="sm:hidden border-t border-white/[0.06] px-4 py-3 bg-[#0a0a0f]/95">
            <button
              type="button"
              onClick={onTelegram}
              className="w-full rounded-lg border border-[#7c3aed]/70 py-2.5 text-sm font-semibold text-[#F1F5F9]"
            >
              Войти
            </button>
          </div>
        )}
      </header>

      {/* Hero — кинематографичный WOW */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-8 pb-20 overflow-hidden">
        <KaliningradSilhouette />
        {/* Световые пятна + лёгкая виньетка */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute -top-[20%] left-1/2 h-[min(75vh,620px)] w-[min(140vw,900px)] -translate-x-1/2 rounded-full blur-[100px] animate-nexus-hero-aurora"
            style={{ background: `radial-gradient(ellipse at center, ${VIOLET}33 0%, transparent 68%)` }}
          />
          <div
            className="absolute bottom-[-15%] right-[-20%] h-[55vh] w-[70vw] max-w-2xl rounded-full blur-[90px] opacity-70"
            style={{ background: `radial-gradient(circle at 40% 40%, ${TEAL}22 0%, transparent 65%)` }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, #0a0a0f 88%)',
            }}
          />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {pairs.map(([ia, ib], i) => {
              const a = heroDots.find((d) => d.id === ia);
              const b = heroDots.find((d) => d.id === ib);
              if (!a || !b) return null;
              return (
                <line
                  key={`${uid}-e-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(148,163,184,0.2)"
                  strokeWidth="0.15"
                  strokeDasharray="0.8 0.8"
                  vectorEffect="non-scaling-stroke"
                  className="animate-nexus-march"
                  style={{ animationDelay: `${(i % 5) * 0.15}s` }}
                />
              );
            })}
            {heroDots.map((d) => (
              <circle
                key={d.id}
                cx={d.x}
                cy={d.y}
                r={d.kind === 'place' ? 0.55 : 0.45}
                fill={d.kind === 'place' ? TEAL : VIOLET}
                className="animate-nexus-dot-pulse"
                style={{
                  transformOrigin: `${d.x}px ${d.y}px`,
                  animationDelay: `${(Number(d.id) || 0) * 0.12}s`,
                }}
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center flex flex-col items-center gap-8 sm:gap-10">
          <p
            className={cn(
              'nexus-hero-rise nexus-hero-rise-d1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em]',
              'text-[#00d4aa]/90',
            )}
          >
            Реальный город · реальные почти-встречи
          </p>

          <div className="nexus-hero-rise nexus-hero-rise-d2 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3">
              <span
                className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-white/25"
                aria-hidden
              />
              <h1
                className="text-[2.75rem] sm:text-[3.25rem] font-medium tracking-[-0.04em] leading-none"
                style={{ fontWeight: 500, color: TEXT }}
              >
                Nexus
              </h1>
              <span
                className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-white/25"
                aria-hidden
              />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Калининград
            </p>
          </div>

          <div className="nexus-hero-rise nexus-hero-rise-d3 space-y-2 sm:space-y-3 px-1">
            <p className="text-[clamp(1.65rem,4.8vw,2.85rem)] font-semibold tracking-[-0.03em] leading-[1.08] text-[#F1F5F9]">
              Твой город помнит всё.
            </p>
            <p className="text-[clamp(1.65rem,4.8vw,2.85rem)] font-semibold tracking-[-0.03em] leading-[1.08] nexus-hero-gradient-text px-2">
              Ты — нет.
            </p>
          </div>

          <div className="nexus-hero-rise nexus-hero-rise-d4 max-w-lg mx-auto space-y-4 px-1">
            <p className="text-lg sm:text-xl font-medium leading-snug text-slate-200/95">
              Пока ты смотришь в экран, кто-то только что стоял там, где ты будешь через пятнадцать минут.
            </p>
            <p className="text-[15px] sm:text-base leading-relaxed text-slate-400">
              Nexus находит эти «почти» — кто, где, на сколько минут вы разминулись. Без отметок и лишнего шума.
              Остаётся решить: написать или просто знать.
            </p>
          </div>

          <div className="nexus-hero-rise nexus-hero-rise-d5 w-full max-w-md flex flex-col items-center gap-4 pt-1">
            <button
              type="button"
              onClick={onTelegram}
              className={cn(
                'nexus-hero-cta-shimmer relative inline-flex w-full sm:w-auto min-w-[min(100%,280px)]',
                'items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white',
                'shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_40px_-8px_rgba(124,58,237,0.65)]',
                'hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_12px_48px_-6px_rgba(124,58,237,0.75)]',
                'transition-all duration-300 active:scale-[0.98]',
              )}
              style={{ backgroundColor: VIOLET }}
            >
              <Send className="w-4 h-4 shrink-0 relative z-[1]" />
              <span className="relative z-[1]">Войти через Telegram</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-y-3 gap-x-6 text-sm w-full">
              <button
                type="button"
                onClick={startDemo}
                className="text-slate-400 hover:text-[#00d4aa] transition-colors underline-offset-4 hover:underline py-1"
              >
                Посмотреть демо без входа
                <span className="whitespace-nowrap"> →</span>
              </button>
              <span className="hidden sm:inline text-slate-600 select-none" aria-hidden>
                ·
              </span>
              <button
                type="button"
                onClick={() => scrollToId('how-it-works')}
                className="text-slate-400 hover:text-slate-200 transition-colors underline-offset-4 hover:underline py-1"
              >
                Как это работает
                <span className="whitespace-nowrap"> ↓</span>
              </button>
            </div>
          </div>

          <p
            className={cn(
              'nexus-hero-rise nexus-hero-rise-d6 text-[11px] text-slate-600 max-w-sm leading-relaxed',
            )}
          >
            Бесплатно · только Калининград · данные под твоим контролем
          </p>
        </div>
      </section>

      {/* Section 2 — как это работает */}
      <section id="how-it-works" className="py-24 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <header className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#00d4aa]/85 mb-4">
                Три шага
              </p>
              <h2
                className="text-[clamp(1.65rem,4vw,2.5rem)] font-semibold tracking-[-0.02em] leading-[1.15]"
                style={{ color: TEXT }}
              >
                Как это работает
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-400 max-w-xl mx-auto">
                Без лишних экранов и «обязательных» действий — город сам становится историей, а ты решаешь, куда
                двигаться дальше.
              </p>
            </header>
          </ScrollReveal>
          <div className="grid gap-7 md:gap-6 lg:gap-8 md:grid-cols-3 items-stretch">
            {[
              {
                id: 'live',
                step: '01',
                accent: TEAL,
                icon: <IconFootprints />,
                title: 'Живи как обычно',
                lead: 'Никаких отметок и «заданий» в телефоне.',
                body: 'Nexus тихо улавливает ритм дня — кампус, кофейни, вечерние улицы. Ты просто живёшь; сервис помнит маршрут и места, чтобы потом всё сложилось в картину.',
              },
              {
                id: 'evening',
                step: '02',
                accent: VIOLET,
                icon: <IconMoonMap />,
                title: 'Вечером — вся картина',
                lead: 'Один взгляд — и день как на ладони.',
                body: 'Маршрут, точки, время: как личный дневник города без обязанности что-то писать. Удобно оглянуться и понять, где ты был по-настоящему живым, а не только «онлайн».',
              },
              {
                id: 'almost',
                step: '03',
                accent: '#f59e0b',
                icon: <IconAlmostLines />,
                title: 'Почти встретились — уже сигнал',
                lead: 'Не рандом в ленте, а почти-реальность.',
                body: 'Катя была в «Буфете» за четверть часа до тебя. Максим — в «Типографии» чуть позже. Такие моменты Nexus подсвечивает сам — дальше только твоё решение: написать или оставить как тёплый след дня.',
              },
            ].map((card) => (
              <ScrollReveal key={card.id}>
                <article
                  className={cn(
                    'group h-full flex flex-col rounded-2xl border border-white/[0.07]',
                    'bg-gradient-to-b from-white/[0.045] to-[#0a0a12]/90',
                    'p-7 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]',
                    'hover:border-white/[0.12] hover:from-white/[0.06] transition-all duration-300',
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <span
                      className="text-[10px] font-bold tabular-nums uppercase tracking-[0.16em]"
                      style={{ color: `${card.accent}cc` }}
                    >
                      {card.step}
                    </span>
                    <div
                      className="rounded-2xl w-[52px] h-[52px] flex items-center justify-center shrink-0 border border-white/[0.06] bg-black/20"
                      style={{ boxShadow: `0 0 24px -8px ${card.accent}40` }}
                    >
                      {card.icon}
                    </div>
                  </div>
                  <h3
                    className="text-xl sm:text-[1.35rem] font-semibold tracking-[-0.02em] leading-snug text-[#F1F5F9] mb-2"
                  >
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] font-medium leading-snug mb-4" style={{ color: card.accent }}>
                    {card.lead}
                  </p>
                  <p className="text-[15px] sm:text-base leading-[1.7] text-slate-400/95 flex-1">
                    {card.body}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionNearMiss />

      {/* Privacy */}
      <section className="py-24 px-4" style={{ backgroundColor: BG }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4" style={{ color: TEXT }}>
              Ты контролируешь всё
            </h2>
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            {[
              {
                title: '🔴 Невидимка',
                text: 'Тебя нет на карте. Никто не видит твои маршруты. Граф растёт только для тебя.',
              },
              {
                title: '🟡 Наблюдатель',
                text: 'Ты видишь пересечения. Другие тебя — нет. Читай не светясь.',
              },
              {
                title: '🟢 Открыт',
                text: 'Появляешься в пересечениях. Знакомишься когда хочешь. Переключается в один тап.',
              },
            ].map((c) => (
              <ScrollReveal key={c.title}>
                <article className="rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-6 space-y-3">
                  <h3 className="text-lg font-semibold" style={{ color: TEXT }}>
                    {c.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                    {c.text}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="mt-10 text-center space-y-2">
            <p className="text-sm font-medium" style={{ color: TEXT }}>
              Default при регистрации — Наблюдатель.
            </p>
            <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: MUTED }}>
              По умолчанию ты невидим. Открываешься только когда готов.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <SectionGraphTeaser />
      <SectionCityStats />

      {/* Final CTA */}
      <section className="py-28 px-4 pb-32" style={{ backgroundColor: BG }}>
        <div className="max-w-lg mx-auto text-center space-y-8">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight" style={{ color: TEXT }}>
              Узнай с кем ты почти познакомился сегодня
            </h2>
            <p className="text-base mt-4" style={{ color: MUTED }}>
              Бесплатно. Только Калининград. Твои данные только твои.
            </p>
          </ScrollReveal>
          <div className="space-y-4">
            <button
              type="button"
              onClick={onTelegram}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#7c3aed]/30"
              style={{ backgroundColor: VIOLET }}
            >
              <Send className="w-4 h-4" />
              Войти через Telegram
            </button>
            <button
              type="button"
              onClick={startDemo}
              className="text-sm w-full py-2 underline-offset-4 hover:underline"
              style={{ color: MUTED }}
            >
              Или посмотри демо без входа →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
