import { mockEvents } from '@/data/mockData';
import EventCard from '@/components/EventCard';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarX } from 'lucide-react';

interface MyEventsPageProps {
  onEventClick: (id: string) => void;
}

export default function MyEventsPage({ onEventClick }: MyEventsPageProps) {
  const { isAuthenticated } = useAuth();
  const recommended = mockEvents.slice(0, 3);

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
