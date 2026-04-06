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

interface FeedPageProps {
  onEventClick: (id: string) => void;
  onOpenMapPlace: (placeId: string) => void;
}

export default function FeedPage({ onEventClick, onOpenMapPlace }: FeedPageProps) {
  const today = getTodayEvents();
  const tomorrow = getTomorrowEvents();
  const showQuiet = today.length === 0;
  const laterEvents = mockEvents.filter((e) => e.date !== 'Сегодня' && e.date !== 'Завтра');
  const pulseCount = useCountUp(CITY_GOING_COUNT, 1200);

  const showDayEndFooter = !showQuiet || tomorrow.length > 0 || laterEvents.length > 0;

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Сейчас</p>

      <div className="relative flex flex-col items-center justify-center mb-6 min-h-[120px]">
        <div
          className="pointer-events-none absolute w-[120px] h-[120px] rounded-full animate-city-breathe-bg"
          aria-hidden
        />
        <span
          className="relative text-[56px] font-medium leading-none text-white tabular-nums"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {pulseCount}
        </span>
        <p className="relative mt-2 text-base text-muted-foreground text-center px-2">
          человек сегодня куда-то идут
        </p>
      </div>

      <div className="mb-7">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
          Прямо сейчас в городе
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {feedLivePlacesMock.map((row) => (
            <div
              key={row.placeId}
              className="min-w-[158px] shrink-0 rounded-xl border border-teal-500/20 bg-card/60 p-3 backdrop-blur-sm"
            >
              <p className="text-[13px] font-bold text-foreground leading-tight">{row.name}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {row.hereCount} человек здесь
              </p>
              {row.friendLine && (
                <p className="text-[11px] text-teal-400 font-medium mt-1.5">{row.friendLine}</p>
              )}
              <button
                type="button"
                onClick={() => onOpenMapPlace(row.placeId)}
                className="mt-2 text-[11px] font-semibold text-teal-400/90 hover:text-teal-300 transition-colors active:scale-[0.98]"
              >
                Зайти на карту
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-5 text-center">Что происходит в Калининграде</p>

      {showQuiet ? (
        <div className="text-center py-8 animate-fade-up">
          <Moon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium text-lg">Сегодня тихо 🌙</p>
          <p className="text-muted-foreground text-sm">Зато завтра:</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Сегодня</p>
          <div className="space-y-3 mb-6">
            {today.map((event, i) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i} />
            ))}
          </div>
        </>
      )}

      {tomorrow.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Завтра</p>
          <div className="space-y-3">
            {tomorrow.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick(event.id)}
                index={i + today.length}
              />
            ))}
          </div>
        </>
      )}

      {laterEvents.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 mt-6 font-semibold">Скоро</p>
          <div className="space-y-3">
            {laterEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick(event.id)}
                index={i + today.length + tomorrow.length}
              />
            ))}
          </div>
        </>
      )}

      {showDayEndFooter && (
        <div className="mt-10 mb-6 text-center space-y-2 animate-fade-up">
          <p className="text-foreground font-medium">Это всё на сегодня 🌙</p>
          <p className="text-sm text-muted-foreground">Завтра появится новое · обновление в 08:00</p>
        </div>
      )}
    </div>
  );
}
