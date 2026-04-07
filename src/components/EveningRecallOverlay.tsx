import { useState } from 'react';
import { Moon, Check, X, Smile } from 'lucide-react';
import { useLocation, type DetectedStop } from '@/contexts/LocationContext';
import { cn } from '@/lib/utils';

const MOODS = ['😊', '☕', '🎵', '💪', '🤝', '🌙'] as const;

function StopCard({ stop, onConfirm, onDismiss }: {
  stop: DetectedStop;
  onConfirm: (mood?: string) => void;
  onDismiss: () => void;
}) {
  const [showMoods, setShowMoods] = useState(false);
  const time = stop.startTime.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });

  if (stop.status !== 'pending') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300',
          stop.status === 'confirmed'
            ? 'bg-teal-500/10 border border-teal-500/20'
            : 'bg-white/[0.03] border border-white/5 opacity-50',
        )}
      >
        <span className="text-lg">{stop.mood || (stop.status === 'confirmed' ? '✅' : '—')}</span>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium truncate', stop.status === 'dismissed' && 'line-through text-muted-foreground')}>
            {stop.label}
          </p>
          <p className="text-[11px] text-muted-foreground">{time} · {stop.durationMin} мин</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-lg">
          {stop.matchedPlace ? stop.matchedPlace.icon : '📍'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{stop.label}</p>
          <p className="text-[11px] text-muted-foreground">{time} · ~{stop.durationMin} мин</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowMoods(true)}
            className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 hover:bg-teal-500/30 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showMoods && (
        <div className="px-4 pb-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Smile className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onConfirm(m)}
              className="text-lg hover:scale-125 transition-transform active:scale-95"
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onConfirm()}
            className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Без эмоции
          </button>
        </div>
      )}

      {stop.matchedPlace && (
        <div className="px-4 pb-3">
          <p className="text-[11px] text-teal-400/80">
            Сегодня здесь было ещё {3 + Math.floor(Math.random() * 12)} человек
          </p>
        </div>
      )}
    </div>
  );
}

export default function EveningRecallOverlay() {
  const { todayStops, showEveningRecall, setShowEveningRecall, confirmStop, dismissStop } =
    useLocation();

  if (!showEveningRecall || todayStops.length === 0) return null;

  const pending = todayStops.filter((s) => s.status === 'pending');
  const confirmed = todayStops.filter((s) => s.status === 'confirmed');
  const allDone = pending.length === 0;

  return (
    <div className="fixed inset-0 z-[4500] flex flex-col bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Moon className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Вечерний обзор</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Твой день в городе</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {allDone
            ? `Готово! ${confirmed.length} мест сохранено`
            : `${pending.length} мест ожидают подтверждения`}
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {todayStops.map((stop) => (
          <StopCard
            key={stop.id}
            stop={stop}
            onConfirm={(mood) => confirmStop(stop.id, mood)}
            onDismiss={() => dismissStop(stop.id)}
          />
        ))}
      </div>

      {/* Bottom */}
      <div className="px-4 pb-8 pt-2">
        {allDone ? (
          <button
            type="button"
            onClick={() => setShowEveningRecall(false)}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold transition-transform active:scale-[0.97]"
          >
            Готово
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowEveningRecall(false)}
            className="w-full py-3 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
          >
            Разберу позже
          </button>
        )}
      </div>
    </div>
  );
}
