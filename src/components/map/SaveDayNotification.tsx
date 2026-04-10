import { useState, useEffect } from 'react';
import type { DayRouteStop } from '@/data/dayRouteData';
import { cn } from '@/lib/utils';

interface SaveDayNotificationProps {
  stops: DayRouteStop[];
  onSave: () => void;
  onDismiss: () => void;
}

export default function SaveDayNotification({ stops, onSave, onDismiss }: SaveDayNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[3000] flex justify-center pointer-events-none">
      <div
        className={cn(
          'pointer-events-auto max-w-sm w-full rounded-2xl px-4 py-3',
          'bg-[#1e2130]/95 border border-violet-500/25 backdrop-blur-xl',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'animate-fade-up',
        )}
      >
        <p className="text-sm font-semibold text-foreground">
          📍 Сегодня ты посетил {stops.length} мест
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Сохранить в твой граф?
        </p>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-2 rounded-xl bg-[#00d4aa] text-[#0f172a] text-xs font-semibold transition-transform active:scale-[0.97]"
          >
            Сохранить день
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-xs text-muted-foreground font-medium transition-transform active:scale-[0.97]"
          >
            Потом
          </button>
        </div>
      </div>
    </div>
  );
}
