import { useRef, useEffect } from 'react';
import type { DayRouteStop } from '@/data/dayRouteData';
import { getTotalNearMissCount, getTotalDistance, getNearMissForStop } from '@/data/dayRouteData';
import { cn } from '@/lib/utils';

interface DayTimelineStripProps {
  stops: DayRouteStop[];
  activeStopId: string | null;
  onStopTap: (stop: DayRouteStop) => void;
}

export default function DayTimelineStrip({ stops, activeStopId, onStopTap }: DayTimelineStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearMissTotal = getTotalNearMissCount();
  const totalKm = getTotalDistance();

  // Auto-scroll to active
  useEffect(() => {
    if (!activeStopId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-stop="${activeStopId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeStopId]);

  return (
    <div className="absolute bottom-16 left-0 right-0 z-[1100] pointer-events-auto animate-slide-up">
      {/* Stats row */}
      <div className="mx-4 mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1e2130]/90 border border-white/8 px-2.5 py-1 backdrop-blur-md">
          📍 {stops.length} мест
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1e2130]/90 border border-white/8 px-2.5 py-1 backdrop-blur-md">
          🗺 {totalKm} км
        </span>
        {nearMissTotal > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 backdrop-blur-md text-amber-400/90">
            ✨ {nearMissTotal} могли познакомиться
          </span>
        )}
      </div>

      {/* Horizontal timeline */}
      <div
        ref={scrollRef}
        className="mx-2 flex gap-2 overflow-x-auto pb-2 px-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {stops.map((stop, i) => {
          const hasNearMiss = getNearMissForStop(stop.id).length > 0;
          const isActive = activeStopId === stop.id;

          return (
            <button
              key={stop.id}
              type="button"
              data-stop={stop.id}
              onClick={() => onStopTap(stop)}
              className={cn(
                'relative shrink-0 rounded-2xl px-3.5 py-2.5 text-left transition-all duration-200 active:scale-[0.96] min-w-[130px]',
                'bg-[#1e2130]/95 border backdrop-blur-md',
                isActive
                  ? 'border-[#00d4aa]/50 bg-[#00d4aa]/[0.08] shadow-[0_0_20px_rgba(0,212,170,0.15)]'
                  : 'border-white/[0.06]',
              )}
            >
              {hasNearMiss && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-[#1e2130]" />
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{stop.icon}</span>
                <span className="text-[11px] font-semibold text-foreground truncate">{stop.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{stop.startTime}</span>
                <span className="text-white/20">·</span>
                <span>{stop.durationLabel}</span>
              </div>
              {/* Connector arrow (except last) */}
              {i < stops.length - 1 && (
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-[#00d4aa]/40 text-xs pointer-events-none">
                  →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
