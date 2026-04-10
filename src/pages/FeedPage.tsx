import {
  mockEvents,
  getTodayEvents,
  getTomorrowEvents,
  CITY_GOING_COUNT,
  feedLivePlacesMock,
} from '@/data/mockData';
import EventCard from '@/components/EventCard';
import { Moon } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import Screen from '@/components/layout/Screen';
import { GlassPanel } from '@/components/ui/glass-panel';

interface FeedPageProps {
  onEventClick: (id: string) => void;
  onOpenMapPlace: (placeId: string) => void;
}

export default function FeedPage({ onEventClick, onOpenMapPlace }: FeedPageProps) {
  const today = getTodayEvents();
  const tomorrow = getTomorrowEvents();
  const showQuiet = today.length === 0;
  const dayRank: Record<string, number> = { Пятница: 1, Суббота: 2, Воскресенье: 3 };
  const laterEvents = mockEvents
    .filter((e) => e.date !== 'Сегодня' && e.date !== 'Завтра')
    .sort((a, b) => (dayRank[a.date] ?? 50) - (dayRank[b.date] ?? 50) || a.time.localeCompare(b.time, undefined, { numeric: true }));
  const pulseCount = useCountUp(CITY_GOING_COUNT, 1200);

  const showDayEndFooter = !showQuiet || tomorrow.length > 0 || laterEvents.length > 0;

  return (
    <Screen>
      {/* Hero pulse */}
      <div className="relative flex flex-col items-center justify-center mb-8 min-h-[130px]">
        <div className="pointer-events-none absolute w-28 h-28 rounded-full bg-primary/8 animate-breathe" aria-hidden />
        <span
          className="relative text-[52px] font-bold leading-none text-foreground tabular-nums"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {pulseCount}
        </span>
        <p className="relative mt-2.5 text-[15px] text-muted-foreground text-center leading-relaxed">
          человек идут сегодня
        </p>
        <div className="pointer-events-none absolute -z-10 top-8 h-20 w-72 rounded-full bg-primary/12 blur-3xl" />
      </div>

      {/* Live places strip */}
      <section className="mb-8">
        <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">
          Прямо сейчас
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {feedLivePlacesMock.map((row) => (
            <button key={row.placeId} type="button" onClick={() => onOpenMapPlace(row.placeId)} className="min-w-[150px] shrink-0 text-left">
              <GlassPanel interactive className="p-3.5">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{row.name}</p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  {row.hereCount} человек
                </p>
                {row.friendLine && (
                  <p className="text-[11px] text-teal font-medium mt-1.5">{row.friendLine}</p>
                )}
              </GlassPanel>
            </button>
          ))}
        </div>
      </section>

      {showQuiet ? (
        <div className="text-center py-10 animate-fade-up">
          <Moon className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-float" />
          <p className="text-foreground font-semibold text-lg">Сегодня тихо 🌙</p>
          <p className="text-muted-foreground text-sm mt-1">Зато завтра:</p>
        </div>
      ) : (
        <section>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Сегодня</p>
          <div className="space-y-2.5 mb-8">
            {today.map((event, i) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i} />
            ))}
          </div>
        </section>
      )}

      {tomorrow.length > 0 && (
        <section>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Завтра</p>
          <div className="space-y-2.5 mb-8">
            {tomorrow.map((event, i) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i + today.length} />
            ))}
          </div>
        </section>
      )}

      {laterEvents.length > 0 && (
        <section>
          <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-3 font-medium">Скоро</p>
          <div className="space-y-2.5">
            {laterEvents.map((event, i) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i + today.length + tomorrow.length} />
            ))}
          </div>
        </section>
      )}

      {showDayEndFooter && (
        <div className="mt-12 mb-6 text-center space-y-1.5 animate-fade-up">
          <p className="text-foreground font-medium">Это всё на сегодня 🌙</p>
          <p className="text-sm text-muted-foreground">Обновление в 08:00</p>
        </div>
      )}
    </Screen>
  );
}
