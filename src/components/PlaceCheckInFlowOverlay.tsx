import { useEffect, useState, useCallback, type CSSProperties } from 'react';
import type { CityPlaceData } from '@/data/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import PlaceMatchFlowOverlay from '@/components/PlaceMatchFlowOverlay';

type Phase = 'mood' | 'graph' | 'placeMatch' | 'done';

/** Автопереход с экрана настроения */
const MOOD_AUTO_MS = 8500;
/** Пауза на анимации «место в графе» перед следующим шагом */
const GRAPH_HOLD_MS = 5200;

const MOODS = [
  { emoji: '😊', label: 'Кайфую' },
  { emoji: '☕', label: 'Работаю' },
  { emoji: '👥', label: 'С друзьями' },
  { emoji: '🎵', label: 'Отдыхаю' },
] as const;

function userInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function PlaceAddedGraphAnim({ placeShort, userLabel }: { placeShort: string; userLabel: string }) {
  return (
    <div className="fixed inset-0 z-[4000] flex flex-col items-center justify-center bg-[#0f1117] px-5">
      <div className="relative w-full max-w-sm rounded-3xl border border-teal-500/20 bg-[#14161f]/95 px-4 py-10 shadow-[0_0_60px_rgba(20,184,166,0.12)]">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-teal-500/80 mb-6">Новая точка графа</p>
        <svg viewBox="0 0 320 160" className="w-full h-40" aria-hidden>
          <defs>
            <filter id="place-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <line
            x1="64"
            y1="80"
            x2="256"
            y2="80"
            fill="none"
            stroke="rgba(45,212,191,0.65)"
            strokeWidth="2.5"
            filter="url(#place-glow)"
            className="animate-place-line-draw"
          />
          <circle cx="64" cy="80" r="28" fill="#3b82f6" opacity="0.95" />
          <text x="64" y="87" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
            {userLabel}
          </text>
          <polygon
            points="256,50 281,65 281,95 256,110 231,95 231,65"
            fill="#0f172a"
            stroke="rgba(45,212,191,0.95)"
            strokeWidth="2"
            className="animate-place-node-pop"
          />
          <text x="256" y="88" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
            {placeShort.length > 12 ? `${placeShort.slice(0, 10)}…` : placeShort}
          </text>
        </svg>
        <p className="animate-place-graph-caption mt-8 text-center text-lg font-semibold text-white leading-snug px-2">
          <span className="text-teal-400">{placeShort}</span>
          <br />
          <span className="text-base font-medium text-muted-foreground">добавлена в ваш граф</span>
        </p>
      </div>
    </div>
  );
}

interface PlaceCheckInFlowOverlayProps {
  place: CityPlaceData;
  open: boolean;
  liveCheckIn: boolean;
  onClose: () => void;
}

export default function PlaceCheckInFlowOverlay({
  place,
  open,
  liveCheckIn,
  onClose,
}: PlaceCheckInFlowOverlayProps) {
  const { userName } = useAuth();
  const { incrementPlaceVisit } = useAppState();
  const [phase, setPhase] = useState<Phase>('mood');
  const uInit = userInitials(userName || 'Гость').slice(0, 2);

  const finalizeGraph = useCallback(() => {
    incrementPlaceVisit(place.id);
    const showMatch = liveCheckIn && !!place.hereNow;
    setPhase(showMatch ? 'placeMatch' : 'done');
    if (!showMatch) onClose();
  }, [place.id, place.hereNow, liveCheckIn, incrementPlaceVisit, onClose]);

  useEffect(() => {
    if (!open) setPhase('mood');
  }, [open]);

  useEffect(() => {
    if (!open || phase !== 'mood') return;
    const t = window.setTimeout(() => setPhase('graph'), MOOD_AUTO_MS);
    return () => clearTimeout(t);
  }, [open, phase]);

  useEffect(() => {
    if (phase !== 'graph') return;
    const t = window.setTimeout(finalizeGraph, GRAPH_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, finalizeGraph]);

  if (!open) return null;

  const moodDur = `${MOOD_AUTO_MS}ms`;

  return (
    <>
      {phase === 'mood' && (
        <div className="fixed inset-0 z-[4000] flex flex-col justify-end bg-black/75 backdrop-blur-[4px]">
          <div className="rounded-t-[1.75rem] border border-white/10 bg-gradient-to-b from-[#1b1e2a] via-[#171923] to-[#12141c] p-6 pb-10 max-w-md mx-auto w-full shadow-[0_-24px_64px_rgba(0,0,0,0.55)]">
            <div className="h-1 w-11 rounded-full bg-white/20 mx-auto mb-6" />
            <p className="text-center text-lg font-bold text-white tracking-tight">Как настроение?</p>
            <p className="text-center text-sm text-muted-foreground mt-2 mb-5 leading-relaxed px-1">
              Можно выбрать эмодзи или пропустить — через несколько секунд откроется следующий шаг
            </p>
            <div
              className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-6 ring-1 ring-white/5"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 via-teal-400 to-cyan-400 opacity-90 animate-mood-timer"
                style={{ '--mood-duration': moodDur } as CSSProperties}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setPhase('graph')}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 py-4 px-1 transition-all hover:bg-white/[0.07] hover:border-teal-500/30 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                >
                  <span className="text-[1.75rem] leading-none select-none">{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight font-medium">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPhase('graph')}
              className="mt-6 w-full py-3 text-sm font-medium text-teal-400/90 rounded-xl border border-transparent hover:bg-white/5 transition-colors active:scale-[0.98]"
            >
              Пропустить шаг
            </button>
          </div>
        </div>
      )}

      {phase === 'graph' && (
        <PlaceAddedGraphAnim
          placeShort={place.name.replace(/«|»/g, '').slice(0, 18)}
          userLabel={uInit}
        />
      )}

      {phase === 'placeMatch' && (
        <PlaceMatchFlowOverlay
          place={place}
          open
          onClose={() => {
            setPhase('done');
            onClose();
          }}
        />
      )}
    </>
  );
}
