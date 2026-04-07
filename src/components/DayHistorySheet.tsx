import { Sparkles } from 'lucide-react';
import type { DetectedStop } from '@/contexts/LocationContext';
import {
  buildDayStoryNarrative,
  formatDurationRu,
  formatStopTime,
} from '@/lib/dayRoute';
import { cn } from '@/lib/utils';

function capitalizeRu(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface DayHistorySheetProps {
  sorted: DetectedStop[];
}

export default function DayHistorySheet({ sorted }: DayHistorySheetProps) {
  const narrative = buildDayStoryNarrative(sorted);
  if (!narrative) return null;

  return (
    <div className="relative -mx-1">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-violet-500/20 px-4 py-5 mb-6',
          'bg-gradient-to-br from-violet-600/[0.22] via-[#1e2130] to-teal-600/[0.12]',
          'shadow-[0_0_40px_-8px_rgba(124,58,237,0.35)]',
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-teal-500/15 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Sparkles className="h-5 w-5 text-violet-200" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-violet-200/80">
              {capitalizeRu(narrative.dateLabel)}
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-white">{narrative.title}</h3>
            <p className="mt-0.5 text-sm font-medium text-teal-200/90">{narrative.subtitle}</p>
          </div>
        </div>

        <p className="relative mt-4 text-sm leading-relaxed text-white/[0.88]">{narrative.body}</p>
        <p className="relative mt-3 text-[11px] leading-relaxed text-white/55 border-t border-white/10 pt-3">
          {narrative.stats}
        </p>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        По часам
      </p>

      <div className="relative pl-2">
        <div
          className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/50 via-violet-400/25 to-teal-500/40"
          aria-hidden
        />
        <ul className="space-y-0">
          {sorted.map((s, i) => (
            <li key={s.id} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#252a3d] text-xs font-bold text-violet-200 ring-2 ring-violet-500/40 shadow-md">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-violet-200">
                    {formatStopTime(s.startTime)}
                  </span>
                  {s.matchedPlace?.icon && (
                    <span className="text-sm" aria-hidden>
                      {s.matchedPlace.icon}
                    </span>
                  )}
                  {s.status === 'confirmed' && s.mood && (
                    <span className="text-sm" title="Настроение">
                      {s.mood}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">{s.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ~{formatDurationRu(s.durationMin)} на месте
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
