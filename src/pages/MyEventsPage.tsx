import { mockEvents, CITY_GOING_COUNT } from '@/data/mockData';
import { useAppState } from '@/contexts/AppStateContext';
import EventCard from '@/components/EventCard';
import { CalendarX } from 'lucide-react';
import { estimateEventStart, formatCountdown } from '@/lib/eventStart';
import type { EventData } from '@/data/types';
import { useEffect, useState } from 'react';
import Screen from '@/components/layout/Screen';

interface MyEventsPageProps {
  onEventClick: (id: string) => void;
}

function GoingCountdown({ event }: { event: EventData }) {
  const start = estimateEventStart(event);
  const [line, setLine] = useState(() => formatCountdown(start.getTime() - Date.now()));
  const [tier, setTier] = useState<'far' | 'day' | 'soon'>('far');

  useEffect(() => {
    const tick = () => {
      const ms = start.getTime() - Date.now();
      setLine(formatCountdown(ms));
      const h = ms / 3600000;
      if (h <= 2) setTier('soon');
      else if (h <= 24) setTier('day');
      else setTier('far');
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <p className={`text-sm font-medium mb-2 tabular-nums ${
      tier === 'far' ? 'text-muted-foreground'
        : tier === 'day' ? 'text-warm'
        : 'text-hot animate-countdown-urgent'
    }`}>
      {line}
    </p>
  );
}

export default function MyEventsPage({ onEventClick }: MyEventsPageProps) {
  const { signedUpEventIds } = useAppState();
  const myEvents = mockEvents.filter((e) => signedUpEventIds.has(e.id));
  const recommended = mockEvents.filter((e) => !signedUpEventIds.has(e.id)).slice(0, 3);

  if (myEvents.length > 0) {
    return (
      <Screen title="Я иду" subtitle="Твои текущие планы и ближайшие события">
        <div className="space-y-3">
          {myEvents.map((event, i) => (
            <div key={event.id}>
              <GoingCountdown event={event} />
              <EventCard event={event} onClick={() => onEventClick(event.id)} index={i} />
            </div>
          ))}
        </div>
        {recommended.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-10 mb-3 font-semibold">
              Ещё интересное
            </p>
            <div className="space-y-3">
              {recommended.map((event, i) => (
                <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i + myEvents.length} />
              ))}
            </div>
          </>
        )}
      </Screen>
    );
  }

  return (
    <Screen title="Я иду" subtitle="Пока пусто — но город уже живет">
      <div className="text-center py-8 animate-fade-up">
        <CalendarX className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-float-gentle" />
        <p className="text-foreground font-semibold text-lg mb-1">Ты ещё никуда не записался</p>
        <p className="text-muted-foreground text-sm mb-8">
          Сейчас в городе {CITY_GOING_COUNT} человек куда-то идут
        </p>
      </div>
      <div className="space-y-3">
        {recommended.map((event, i) => (
          <div key={event.id} className="staggered-list-up" style={{ animationDelay: `${i * 0.12}s` }}>
            <EventCard event={event} onClick={() => onEventClick(event.id)} index={i} revealOnScroll={false} />
          </div>
        ))}
      </div>
    </Screen>
  );
}
