import { useEffect, useState, useCallback, useRef } from 'react';
import type { CityPlaceData } from '@/data/types';
import {
  demoPlaceMatchPerson,
  getCombinedGraphStats,
  graphProfileEventsMock,
  graphProfilePlacesMock,
  mergeGraphNodesWithAcquaintances,
  mergePlaceGraphWithAcquaintances,
  matchPlacePersonToPersonData,
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { Share } from 'lucide-react';

const TEAL = '#14b8a6';
const BLUE = '#3b82f6';
const PURPLE = '#7c3aed';

type Phase = 'match' | 'wait' | 'typing' | 'connection' | 'share' | 'done';

interface PlaceMatchFlowOverlayProps {
  place: CityPlaceData;
  open: boolean;
  onClose: () => void;
}

function userInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function TrianglePlaceGraph({
  userLabel,
  placeLabel,
  personInitials,
}: {
  userLabel: string;
  placeLabel: string;
  personInitials: string;
}) {
  return (
    <svg
      width="100%"
      height={220}
      viewBox="0 0 320 220"
      className="place-match-graph overflow-visible"
      aria-hidden
    >
      <line
        x1="56"
        y1="120"
        x2="160"
        y2="72"
        className="match-tri-line"
        style={{ stroke: 'rgba(20,184,166,0.45)' }}
        fill="none"
        strokeWidth="2"
      />
      <line
        x1="160"
        y1="72"
        x2="264"
        y2="120"
        className="match-tri-line match-tri-line--d1"
        style={{ stroke: 'rgba(20,184,166,0.45)' }}
        fill="none"
        strokeWidth="2"
      />
      <line
        x1="56"
        y1="120"
        x2="264"
        y2="120"
        className="match-tri-line match-tri-line--d2"
        style={{ stroke: 'rgba(20,184,166,0.45)' }}
        fill="none"
        strokeWidth="2"
      />
      <text x="98" y="88" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="500">
        здесь
      </text>
      <text x="198" y="88" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="500">
        здесь
      </text>
      <circle cx="56" cy="120" r="28" fill={BLUE} />
      <text x="56" y="126" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
        {userLabel}
      </text>
      <circle cx="160" cy="72" r="34" fill="#1e2130" stroke={TEAL} strokeWidth="2" />
      <g
        transform="translate(148, 50) scale(0.62)"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" fill="rgba(20,184,166,0.35)" stroke="rgba(255,255,255,0.92)" />
      </g>
      <text
        x="160"
        y="84"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="600"
      >
        {placeLabel.length > 14 ? `${placeLabel.slice(0, 12)}…` : placeLabel}
      </text>
      <circle cx="264" cy="120" r="28" fill={PURPLE} />
      <text x="264" y="126" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
        {personInitials}
      </text>
    </svg>
  );
}

function PlaceConnectionAnim({
  placeShort,
  partnerName,
  partnerInitials,
  userInitials,
  onDone,
}: {
  placeShort: string;
  partnerName: string;
  partnerInitials: string;
  userInitials: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 5200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[4000] flex flex-col items-center justify-center bg-gradient-to-b from-[#0f1117] via-[#12151f] to-[#0a0c12] px-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_50%_35%,rgba(20,184,166,0.9),transparent_55%)]" />
      <div className="relative h-44 w-full max-w-sm flex items-center justify-center">
        <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[3.75rem] h-[3.75rem] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-[0_8px_28px_rgba(59,130,246,0.35)] ring-2 ring-teal-400/25 ring-offset-2 ring-offset-[#12151f] animate-place-conn-left bg-[#3b82f6]">
          {userInitials}
        </div>
        <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[3.75rem] h-[3.75rem] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-[0_8px_28px_rgba(124,58,237,0.35)] ring-2 ring-teal-400/25 ring-offset-2 ring-offset-[#12151f] animate-place-conn-right bg-[#7c3aed]">
          {partnerInitials}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4.5rem] h-[4.5rem] animate-place-conn-pulse flex items-center justify-center">
          <div className="relative w-[3.25rem] h-[3.25rem] rounded-xl bg-[#1e2130] border-2 flex flex-col items-center justify-center gap-0.5 px-1 text-white animate-place-conn-center border-teal-400/60 shadow-[0_0_24px_rgba(20,184,166,0.2)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-teal-400 shrink-0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[8px] font-semibold text-center leading-tight text-white/95">
              {placeShort.length > 9 ? `${placeShort.slice(0, 7)}…` : placeShort}
            </span>
          </div>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 320 160">
          <defs>
            <linearGradient id="place-conn-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(20,184,166,0.15)" />
              <stop offset="50%" stopColor="rgba(20,184,166,0.75)" />
              <stop offset="100%" stopColor="rgba(20,184,166,0.15)" />
            </linearGradient>
          </defs>
          <line
            x1="52"
            y1="80"
            x2="160"
            y2="80"
            stroke="url(#place-conn-line-grad)"
            strokeWidth="2.5"
            className="animate-place-conn-line"
          />
          <line
            x1="268"
            y1="80"
            x2="160"
            y2="80"
            stroke="url(#place-conn-line-grad)"
            strokeWidth="2.5"
            className="animate-place-conn-line"
          />
        </svg>
      </div>
      <p className="relative mt-10 text-2xl font-bold tracking-tight text-white animate-place-conn-title">
        Связь создана
      </p>
      <p className="relative mt-3 text-sm text-white/55 text-center max-w-xs leading-relaxed animate-place-conn-sub">
        {partnerName} появится в вашем графе — точка места связывает вас
      </p>
    </div>
  );
}

export default function PlaceMatchFlowOverlay({ place, open, onClose }: PlaceMatchFlowOverlayProps) {
  const { userName } = useAuth();
  const { addAcquaintanceAtPlace, eventAcquaintances, placeVisitCounts, placeAcquaintances } =
    useAppState();
  const [phase, setPhase] = useState<Phase>('match');
  const meetStarted = useRef(false);

  const person = demoPlaceMatchPerson;
  const uInit = userInitials(userName || 'Гость');
  const placeShort = place.name.replace(/«|»/g, '');
  const centerLabel = placeShort.length > 14 ? `${placeShort.slice(0, 12)}…` : placeShort;

  const mergedEvents = mergeGraphNodesWithAcquaintances(graphProfileEventsMock, eventAcquaintances);
  const mergedPlaces = mergePlaceGraphWithAcquaintances(
    graphProfilePlacesMock,
    placeAcquaintances,
    placeVisitCounts,
  );
  const stats = getCombinedGraphStats(mergedEvents, mergedPlaces);

  const handleMeet = useCallback(() => {
    if (meetStarted.current) return;
    meetStarted.current = true;
    setPhase('wait');
    window.setTimeout(() => {
      setPhase('typing');
      window.setTimeout(() => setPhase('connection'), 3000);
    }, 3600);
  }, []);

  useEffect(() => {
    if (open) {
      setPhase('match');
      meetStarted.current = false;
      return;
    }
    setPhase('match');
    meetStarted.current = false;
  }, [open]);

  const handleSkip = () => {
    setPhase('done');
    onClose();
  };

  const handleConnectionDone = () => {
    addAcquaintanceAtPlace(place.id, matchPlacePersonToPersonData());
    setPhase('share');
  };

  const handleShareFinish = () => {
    setPhase('done');
    onClose();
  };

  if (!open) return null;

  const shareCard = (
    <div className="rounded-2xl border border-white/10 bg-[#1e2130] p-5 shadow-2xl text-left space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-teal-400/80">Сводка для друзей</p>
        <p className="text-base font-semibold text-white mt-1 leading-snug">
          Где я бываю и с кем пересекаюсь в Калининграде
        </p>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">
        Это короткий текстовый пост: сколько у тебя на графе точек (события + места) и сколько разных людей
        там связано. Не геолокация и не список адресов — только цифры «живого» присутствия в городе.
      </p>
      <div className="rounded-xl bg-black/25 border border-white/5 px-3 py-3 space-y-1">
        <p className="text-sm text-white">
          <span className="font-semibold tabular-nums">{stats.eventsAndPlaces}</span> точек на графе{' '}
          <span className="text-white/45">(события и места)</span>
        </p>
        <p className="text-sm text-white">
          <span className="font-semibold tabular-nums">{stats.connectionsUnique}</span> человек в круге по
          событиям и местам
        </p>
      </div>
      <p className="text-center text-[11px] text-white/35 tracking-wide pt-1">Nexus</p>
    </div>
  );

  return (
    <>
      {phase === 'match' && (
        <div className="fixed inset-0 z-[4000] flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-200" />
          <div className="relative max-w-md mx-auto w-full rounded-t-[1.75rem] border border-teal-500/20 bg-[#1e2130] animate-slide-up overflow-hidden shadow-[0_-20px_60px_rgba(20,184,166,0.12)]">
            <div className="h-1 w-12 rounded-full bg-white/20 mx-auto mt-3 mb-1" />
            <div className="px-5 pt-2 pb-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-center text-lg font-bold text-white mb-1">Совпадение</h2>
              <p className="text-center text-sm text-teal-400/90 mb-4 px-2">
                Максим тоже здесь сейчас — познакомиться?
              </p>
              <div className="rounded-2xl bg-gradient-to-b from-teal-500/10 to-transparent border border-teal-500/20 px-3 pt-4 pb-2">
                <TrianglePlaceGraph
                  userLabel={uInit.slice(0, 2)}
                  placeLabel={centerLabel}
                  personInitials={person.initials}
                />
                <p className="text-center text-[11px] text-muted-foreground pb-3">
                  Общее место в вашем графе
                </p>
              </div>
              <div className="mt-5 flex flex-col items-center">
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg font-bold text-white mb-3"
                  style={{ backgroundColor: PURPLE }}
                >
                  {person.initials}
                </div>
                <p className="text-base font-semibold text-white">
                  {person.name} · {person.subtitle}
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1 px-2">{person.bio}</p>
                <span className="mt-3 inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-muted-foreground">
                  {place.name}
                </span>
              </div>
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => handleMeet()}
                  className="w-full py-3.5 rounded-xl font-semibold text-[#0f172a] bg-teal-400 hover:bg-teal-300 transition-transform active:scale-[0.97]"
                >
                  Познакомиться
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full py-2 text-sm text-muted-foreground active:scale-[0.97] transition-transform"
                >
                  Пропустить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'wait' && (
        <div className="fixed inset-0 z-[4000] flex flex-col items-center justify-center bg-[#0f1117] px-6 gap-3 animate-in fade-in duration-300">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-teal-400/80 animate-pulse"
                style={{ animationDelay: `${i * 180}ms` }}
              />
            ))}
          </div>
          <p className="text-sm text-white/85 font-medium text-center">Отправляем приглашение познакомиться…</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
            Пока собеседник не ответил, можно подождать на этом экране
          </p>
        </div>
      )}

      {phase === 'typing' && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/75 px-6 animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <p className="text-white text-sm font-medium">Максим отвечает…</p>
          </div>
        </div>
      )}

      {phase === 'connection' && (
        <PlaceConnectionAnim
          placeShort={placeShort}
          partnerName={person.name}
          partnerInitials={person.initials}
          userInitials={uInit.slice(0, 2)}
          onDone={handleConnectionDone}
        />
      )}

      {phase === 'share' && (
        <div className="fixed inset-0 z-[4000] flex flex-col items-center justify-center bg-[#0a0c12] px-4 py-8 animate-in fade-in duration-500">
          <div className="w-full max-w-sm space-y-2 mb-4 text-center">
            <p className="text-teal-400/90 text-xs font-medium uppercase tracking-wide">Готово</p>
            <h3 className="text-lg font-bold text-white leading-tight">
              {person.name} добавлен в твой граф
            </h3>
            <p className="text-sm text-white/55 leading-relaxed">
              Открой профиль — увидишь новую связь через это место. Ниже — опционально отправить друзьям
              короткую сводку цифрами (без адресов).
            </p>
          </div>
          {shareCard}
          <button
            type="button"
            className="mt-6 w-full max-w-sm py-3.5 rounded-xl font-semibold text-[#0f172a] bg-teal-400 hover:bg-teal-300 active:scale-[0.97] transition-transform"
            onClick={handleShareFinish}
          >
            Продолжить
          </button>
          <button
            type="button"
            className="mt-3 w-full max-w-sm py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/15 text-white/90 hover:bg-white/5 active:scale-[0.97] transition-colors"
            onClick={async () => {
              const text = `В Калининграде у меня на графе Nexus ${stats.eventsAndPlaces} точек (события и места) и ${stats.connectionsUnique} человек в круге — без адресов, просто о том, как я живу город.`;
              try {
                if (navigator.share) await navigator.share({ title: 'Nexus — граф в городе', text });
              } catch {
                /* */
              }
            }}
          >
            <Share className="w-4 h-4 opacity-90" />
            Отправить сводку друзьям
          </button>
          <p className="mt-3 text-[11px] text-white/40 text-center max-w-xs">
            «Отправить» откроет меню системы; можно отменить и просто нажать «Продолжить».
          </p>
        </div>
      )}
    </>
  );
}
