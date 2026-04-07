import { useEffect, useState } from 'react';
import type { EventData } from '@/data/types';
import {
  demoMatchPerson,
  getEventCenterNodeLabel,
  getMatchTagLine,
  graphProfileEventsMock,
  getGraphProfileStats,
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { matchPersonToPersonData, useAppState } from '@/contexts/AppStateContext';
import { Share } from 'lucide-react';

const PURPLE = '#7c3aed';
const BLUE = '#3b82f6';

type Phase = 'match' | 'wait' | 'typing' | 'connection' | 'share' | 'done';

interface MatchFlowOverlayProps {
  event: EventData;
  open: boolean;
  onClose: () => void;
}

function userInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function TriangleMatchGraph({
  userLabel,
  eventLabel,
  personInitials,
}: {
  userLabel: string;
  eventLabel: string;
  personInitials: string;
}) {
  return (
    <svg
      width="100%"
      height={220}
      viewBox="0 0 320 220"
      className="overflow-visible"
      aria-hidden
    >
      <line
        x1="56"
        y1="120"
        x2="160"
        y2="72"
        className="match-tri-line"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      <line
        x1="160"
        y1="72"
        x2="264"
        y2="120"
        className="match-tri-line match-tri-line--d1"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      <line
        x1="56"
        y1="120"
        x2="264"
        y2="120"
        className="match-tri-line match-tri-line--d2"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      {/* labels on left and right segments (Ты–центр и центр–партнёр) */}
      <text x="98" y="88" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="500">
        идёт
      </text>
      <text x="198" y="88" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="500">
        идёт
      </text>
      {/* Left — Ты */}
      <circle cx="56" cy="120" r="28" fill={BLUE} />
      <text
        x="56"
        y="126"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
      >
        {userLabel}
      </text>
      {/* Center — event */}
      <circle cx="160" cy="72" r="34" fill="#1e2130" stroke="rgba(124,58,237,0.5)" strokeWidth="2" />
      <text
        x="160"
        y="68"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="600"
      >
        {eventLabel.length > 16 ? `${eventLabel.slice(0, 14)}…` : eventLabel}
      </text>
      {/* Right — partner */}
      <circle cx="264" cy="120" r="28" fill={PURPLE} />
      <text
        x="264"
        y="126"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
      >
        {personInitials}
      </text>
    </svg>
  );
}

function MiniShareGraph({ connections: c }: { connections: number }) {
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[200px] mx-auto" aria-hidden>
      <line x1="100" y1="60" x2="40" y2="30" stroke={PURPLE} strokeWidth="2" opacity="0.5" />
      <line x1="100" y1="60" x2="160" y2="30" stroke={PURPLE} strokeWidth="2" opacity="0.5" />
      <line x1="100" y1="60" x2="100" y2="100" stroke={PURPLE} strokeWidth="2" opacity="0.5" />
      <circle cx="100" cy="60" r="18" fill="#1e2130" stroke={PURPLE} strokeWidth="2" />
      <circle cx="40" cy="30" r="12" fill={BLUE} />
      <circle cx="160" cy="30" r="12" fill={PURPLE} />
      <circle cx="100" cy="100" r="12" fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 4" />
      <text x="100" y="115" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">
        {c} связей
      </text>
    </svg>
  );
}

function ConnectionCreatedAnimation({
  eventTitle,
  partnerName,
  partnerInitials,
  userInitials,
  onDone,
}: {
  eventTitle: string;
  partnerName: string;
  partnerInitials: string;
  userInitials: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  const shortEv =
    eventTitle.length > 12 ? `${eventTitle.slice(0, 10)}…` : eventTitle;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#0f1117]/95 px-6">
      <div className="relative h-40 w-full max-w-sm flex items-center justify-center">
        <div
          className="absolute left-[8%] top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-connection-left bg-[#3b82f6]"
          style={{ animationDelay: '0ms' }}
        >
          {userInitials}
        </div>
        <div
          className="absolute right-[8%] top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-connection-right"
          style={{ animationDelay: '0ms' }}
        >
          {partnerInitials}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 animate-connection-pulse flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full bg-[#1e2130] border-2 flex items-center justify-center text-[10px] font-semibold text-center leading-tight px-1 text-white animate-connection-event-pop border-[#7c3aed]/60"
            style={{ animationDelay: '0ms' }}
          >
            {shortEv}
          </div>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 160">
          <line
            x1="52"
            y1="80"
            x2="160"
            y2="80"
            stroke="rgba(124,58,237,0.6)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-connection-line"
          />
          <line
            x1="268"
            y1="80"
            x2="160"
            y2="80"
            stroke="rgba(124,58,237,0.6)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-connection-line"
          />
        </svg>
      </div>
      <p className="mt-8 text-xl font-bold text-white animate-in fade-in duration-300">
        Связь создана
      </p>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
        {partnerName} появится в вашем графе
      </p>
    </div>
  );
}

export default function MatchFlowOverlay({ event, open, onClose }: MatchFlowOverlayProps) {
  const { userName } = useAuth();
  const { addAcquaintanceAtEvent } = useAppState();
  const [phase, setPhase] = useState<Phase>('match');

  useEffect(() => {
    if (!open) {
      setPhase('match');
    }
  }, [open]);

  if (!open) return null;

  const person = demoMatchPerson;
  const tag = getMatchTagLine(event);
  const centerLabel = getEventCenterNodeLabel(event);
  const uInit = userInitials(userName || 'Гость');

  const handleSkip = () => {
    setPhase('done');
    onClose();
  };

  const handleMeet = () => {
    setPhase('wait');
    window.setTimeout(() => {
      setPhase('typing');
      window.setTimeout(() => {
        setPhase('connection');
      }, 900);
    }, 1500);
  };

  const handleConnectionDone = () => {
    addAcquaintanceAtEvent(event.id, matchPersonToPersonData());
    setPhase('share');
  };

  const handleShareFinish = () => {
    setPhase('done');
    onClose();
  };

  const stats = getGraphProfileStats(graphProfileEventsMock);

  const shareCard = (
    <div className="rounded-2xl border border-white/10 bg-[#1e2130] p-5 shadow-2xl">
      <MiniShareGraph connections={stats.connections} />
      <p className="text-center text-lg font-semibold text-white mt-2">
        Мой граф событий в Калининграде
      </p>
      <p className="text-center text-sm text-muted-foreground mt-1">
        {stats.attended} событий · {stats.connections} связей
      </p>
      <p className="text-center text-xs text-white/40 mt-4 tracking-wide">Nexus</p>
    </div>
  );

  return (
    <>
      {phase === 'match' && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-200" />
          <div
            className="relative max-w-md mx-auto w-full rounded-t-[1.75rem] border border-white/10 bg-[#1e2130] shadow-[0_-12px_48px_rgba(124,58,237,0.15)] animate-slide-up overflow-hidden"
            style={{ boxShadow: '0 -20px 60px rgba(124, 58, 237, 0.12)' }}
          >
            <div className="h-1 w-12 rounded-full bg-white/20 mx-auto mt-3 mb-1" />
            <div className="px-5 pt-2 pb-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-center text-lg font-bold text-white mb-1">Совпадение</h2>
              <p className="text-center text-xs text-muted-foreground mb-4">
                Новая связь через событие
              </p>

              <div className="rounded-2xl bg-gradient-to-b from-[#7c3aed]/15 to-transparent border border-[#7c3aed]/20 px-3 pt-4 pb-2">
                <TriangleMatchGraph
                  userLabel={uInit.length > 2 ? uInit.slice(0, 2) : uInit}
                  eventLabel={centerLabel}
                  personInitials={person.initials}
                />
                <p className="text-center text-[11px] text-muted-foreground pb-3">
                  Новая связь в вашем графе
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
                  {tag}
                </span>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleMeet}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-transform active:scale-[0.97] shadow-lg"
                  style={{ backgroundColor: PURPLE }}
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
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-[#0f1117] px-6">
          <p className="text-sm text-muted-foreground">Ожидаем ответ…</p>
        </div>
      )}

      {phase === 'typing' && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/75 px-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <p className="text-white text-sm font-medium">Алина отвечает...</p>
          </div>
        </div>
      )}

      {phase === 'connection' && (
        <ConnectionCreatedAnimation
          eventTitle={event.title}
          partnerName={person.name}
          partnerInitials={person.initials}
          userInitials={uInit.slice(0, 2)}
          onDone={handleConnectionDone}
        />
      )}

      {phase === 'share' && (
        <div className="fixed inset-0 z-[115] flex flex-col items-center justify-center bg-black/80 px-4 animate-in fade-in">
          <p className="text-white font-semibold mb-4">Поделиться своим графом</p>
          {shareCard}
          <button
            type="button"
            className="mt-6 w-full max-w-sm py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ backgroundColor: PURPLE }}
            onClick={async () => {
              const text = `Мой граф событий в Калининграде — ${stats.attended} событий, ${stats.connections} связей. Nexus`;
              try {
                if (navigator.share) {
                  await navigator.share({ title: 'Nexus', text });
                }
              } catch {
                /* user cancelled */
              }
              handleShareFinish();
            }}
          >
            <Share className="w-4 h-4" />
            Поделиться
          </button>
          <button
            type="button"
            onClick={handleShareFinish}
            className="mt-3 text-sm text-muted-foreground active:scale-[0.97]"
          >
            Закрыть
          </button>
        </div>
      )}
    </>
  );
}
