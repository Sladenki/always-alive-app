import { mockEvents, getTodayEvents, getTomorrowEvents, getInterestCount } from '@/data/mockData';
import EventCard from '@/components/EventCard';
import { Moon } from 'lucide-react';

interface FeedPageProps {
  onEventClick: (id: string) => void;
}

export default function FeedPage({ onEventClick }: FeedPageProps) {
  const today = getTodayEvents();
  const tomorrow = getTomorrowEvents();
  const showQuiet = today.length === 0;

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Сейчас</h1>
      <p className="text-sm text-muted-foreground mb-5">Что происходит в Калининграде</p>

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
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i + today.length} />
            ))}
          </div>
        </>
      )}

      {mockEvents.filter(e => e.date !== 'Сегодня' && e.date !== 'Завтра').length > 0 && (
        <>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 mt-6 font-semibold">Скоро</p>
          <div className="space-y-3">
            {mockEvents.filter(e => e.date !== 'Сегодня' && e.date !== 'Завтра').map((event, i) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
