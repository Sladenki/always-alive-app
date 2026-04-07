import { useState } from 'react';
import { Bug, MapPin, Zap, ChevronDown, ChevronUp, Crosshair } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { cn } from '@/lib/utils';

export default function DevPanel() {
  const loc = useLocation();
  const [expanded, setExpanded] = useState(false);

  if (!loc.devMode) return null;

  const confirmed = loc.todayStops.filter((s) => s.status === 'confirmed').length;
  const pending = loc.todayStops.filter((s) => s.status === 'pending').length;

  return (
    <div className="fixed top-2 right-2 z-[5000] w-72">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-violet-600/90 text-white text-xs font-semibold backdrop-blur-md border border-violet-400/30 shadow-lg"
      >
        <span className="flex items-center gap-1.5">
          <Bug className="w-3.5 h-3.5" />
          DEV MODE
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="mt-1 rounded-xl bg-[#1a1d2e]/95 border border-white/10 backdrop-blur-md p-3 space-y-3 text-xs text-foreground shadow-xl">
          {/* Current position */}
          <div>
            <p className="text-muted-foreground mb-1 flex items-center gap-1">
              <Crosshair className="w-3 h-3" /> Позиция
            </p>
            {loc.currentPos ? (
              <p className="font-mono text-[10px]">
                {loc.currentPos[0].toFixed(4)}, {loc.currentPos[1].toFixed(4)}
              </p>
            ) : (
              <p className="text-muted-foreground italic">Не задана</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div>
              <p className="text-muted-foreground">Чек-ины</p>
              <p className="font-semibold">{loc.checkinCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Карта</p>
              <p className="font-semibold">{loc.mapOpenCount}×</p>
            </div>
            <div>
              <p className="text-muted-foreground">Режим</p>
              <p className={cn('font-semibold', loc.mode === 'smart' ? 'text-teal-400' : '')}>
                {loc.mode === 'smart' ? 'Умный' : 'Базовый'}
              </p>
            </div>
          </div>

          {/* Stops */}
          <div>
            <p className="text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Остановки: {pending} ожидают, {confirmed} ✓
            </p>
            <div className="max-h-28 overflow-y-auto space-y-1">
              {loc.todayStops.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]',
                    s.status === 'confirmed'
                      ? 'bg-teal-500/15 text-teal-300'
                      : s.status === 'dismissed'
                        ? 'bg-white/5 text-muted-foreground line-through'
                        : 'bg-white/5',
                  )}
                >
                  <span>{s.mood || '📍'}</span>
                  <span className="truncate flex-1">{s.label}</span>
                  <span className="text-muted-foreground">
                    {s.startTime.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loc.devGenerateDay}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-violet-500/20 border border-violet-400/20 text-violet-300 font-medium hover:bg-violet-500/30 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Сгенерировать день
            </button>
            <button
              type="button"
              onClick={() => loc.setShowEveningRecall(true)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground font-medium hover:bg-white/10 transition-colors"
            >
              Evening Recall
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center">
            Кликайте по карте чтобы задать позицию
          </p>
        </div>
      )}
    </div>
  );
}
