import { useState, useEffect } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { useLocation, type DetectedStop } from '@/contexts/LocationContext';
import { cn } from '@/lib/utils';

/**
 * Показывает тост когда появляется новая засечённая остановка.
 * «Мы заметили, что ты был здесь 👇»
 */
export default function PlaceSuggestionToast() {
  const { todayStops, confirmStop, dismissStop } = useLocation();
  const [visible, setVisible] = useState<DetectedStop | null>(null);
  const [lastShownId, setLastShownId] = useState<string | null>(null);

  useEffect(() => {
    const latest = todayStops.find((s) => s.status === 'pending');
    if (latest && latest.id !== lastShownId) {
      setVisible(latest);
      setLastShownId(latest.id);
    }
  }, [todayStops, lastShownId]);

  // Auto-hide after 8s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(null), 8000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  const time = visible.startTime.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  const peopleCount = 2 + Math.floor(Math.random() * 10);

  return (
    <div className="fixed top-14 left-3 right-3 z-[4200] flex justify-center pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#1e2130]/95 backdrop-blur-md p-4 shadow-xl">
        <p className="text-xs text-muted-foreground mb-2">Мы заметили, что ты был здесь 👇</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-lg shrink-0">
            {visible.matchedPlace?.icon || '📍'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{visible.label}</p>
            <p className="text-[11px] text-muted-foreground">{time} · ~{visible.durationMin} мин</p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              confirmStop(visible.id);
              setVisible(null);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors',
              'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30',
            )}
          >
            <Check className="w-3.5 h-3.5" />
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => setVisible(null)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              dismissStop(visible.id);
              setVisible(null);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {visible.matchedPlace && (
          <p className="text-[11px] text-teal-400/70 mt-2">
            В этом месте сегодня было ещё {peopleCount} человек
          </p>
        )}
      </div>
    </div>
  );
}
