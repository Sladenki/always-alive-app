import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { DayRouteStop, NearMissPerson } from '@/data/dayRouteData';
import { cn } from '@/lib/utils';
import { ChevronRight, Share2 } from 'lucide-react';
import NearMissShareCard from '@/components/NearMissShareCard';

interface NearMissSheetProps {
  stop: DayRouteStop | null;
  people: NearMissPerson[];
  open: boolean;
  onClose: () => void;
  /** Следующая остановка маршрута (если есть) */
  nextStop?: DayRouteStop | null;
  /** Перейти к следующему пункту: карта, таймлайн и шит обновятся */
  onGoToNextStop?: () => void;
}

export default function NearMissSheet({
  stop,
  people,
  open,
  onClose,
  nextStop,
  onGoToNextStop,
}: NearMissSheetProps) {
  const [shareTarget, setShareTarget] = useState<{ place: string; delta: string } | null>(null);
  if (!stop) return null;

  const hasNext = Boolean(nextStop && onGoToNextStop);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="z-[2200]"
        className="z-[2200] max-h-[70vh] overflow-y-auto max-w-md mx-auto left-0 right-0 rounded-t-3xl bg-[#161a28] border border-white/[0.06] pb-28 pt-2 data-[state=open]:!animate-none shadow-[0_-20px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <SheetHeader className="text-left space-y-1">
          <SheetTitle className="text-lg flex items-center gap-2">
            <span>{stop.icon}</span> {stop.label}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            {stop.startTime} — {stop.endTime} · {stop.durationLabel}
          </p>
        </SheetHeader>

        {people.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm font-semibold text-amber-400/90 flex items-center gap-1.5">
              ✨ Вы почти встретились
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Эти люди были здесь примерно в то же время
            </p>

            <div className="mt-4 space-y-3">
              {people.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-3',
                    'bg-amber-500/[0.06] border border-amber-500/15',
                  )}
                >
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.timeLabel}</p>
                    <p className="text-[11px] text-amber-400/70 mt-0.5">{p.deltaLabel}</p>
                  </div>

                  {/* Mini graph: two dots almost touching */}
                  <svg width="44" height="28" viewBox="0 0 44 28" className="shrink-0">
                    <line x1="10" y1="14" x2="34" y2="14" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
                    <circle cx="10" cy="14" r="5" fill="#00d4aa" opacity="0.9" />
                    <circle cx="34" cy="14" r="5" fill="#f59e0b" opacity="0.9" />
                  </svg>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-5 w-full py-3.5 rounded-xl bg-amber-500 text-[#0f172a] font-semibold transition-transform active:scale-[0.97] text-sm"
            >
              Познакомиться сейчас
            </button>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                className="flex-1 py-3.5 rounded-xl bg-amber-500 text-[#0f172a] font-semibold transition-transform active:scale-[0.97] text-sm"
              >
                Познакомиться сейчас
              </button>
              <button
                type="button"
                onClick={() => setShareTarget({ place: stop.label, delta: people[0]?.deltaLabel || '' })}
                className="px-4 py-3.5 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
              Были в одном месте — и не встретились. Исправим?
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Никого не было рядом в это время
            </p>
          </div>
        )}

        {hasNext && nextStop && (
          <button
            type="button"
            onClick={() => onGoToNextStop?.()}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#00d4aa]/35 bg-[#00d4aa]/[0.08] text-[#5eead4] font-semibold text-sm transition-transform active:scale-[0.97]"
          >
            <span className="truncate">
              Следующий пункт: {nextStop.icon} {nextStop.label}
            </span>
            <ChevronRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
}
