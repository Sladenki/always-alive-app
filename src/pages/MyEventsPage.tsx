import { mockEvents } from '@/data/mockData';
import { useAppState } from '@/contexts/AppStateContext';
import EventCard from '@/components/EventCard';
import { CalendarX, Check } from 'lucide-react';

interface MyEventsPageProps {
  onEventClick: (id: string) => void;
}

export default function MyEventsPage({ onEventClick }: MyEventsPageProps) {
  const { signedUpEventIds } = useAppState();
  const myEvents = mockEvents.filter(e => signedUpEventIds.has(e.id));
  const recommended = mockEvents.filter(e => !signedUpEventIds.has(e.id)).slice(0, 3);

  if (myEvents.length > 0) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-5">Я иду</h1>
        <div className="space-y-3">
          {myEvents.map((event, i) => (
            <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i} />
          ))}
        </div>
        {recommended.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-8 mb-3 font-semibold">Ещё интересное</p>
            <div className="space-y-3">
              {recommended.map((event, i) => (
                <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">Я иду</h1>
      <div className="text-center py-8 animate-fade-up">
        <CalendarX className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium text-lg mb-1">Ты ещё никуда не записался</p>
        <p className="text-muted-foreground text-sm mb-6">Начни с чего-нибудь интересного 👇</p>
      </div>
      <div className="space-y-3">
        {recommended.map((event, i) => (
          <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} index={i} />
        ))}
      </div>
    </div>
  );
}
