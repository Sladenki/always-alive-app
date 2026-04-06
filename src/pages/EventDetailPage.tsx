import { mockEvents, getInterestCount, getAttendeesWithPlaceholders } from '@/data/mockData';
import { EventTemperature } from '@/data/types';
import PersonCard from '@/components/PersonCard';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Clock, Eye, Flame } from 'lucide-react';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetailPage({ eventId, onBack }: EventDetailPageProps) {
  const event = mockEvents.find(e => e.id === eventId);
  const { requestAuth, isAuthenticated } = useAuth();

  if (!event) return null;

  const interest = getInterestCount(event);
  const attendees = getAttendeesWithPlaceholders(event);

  const coldMessage = event.realSignups === 0
    ? `👀 ${interest} человек смотрят это событие. Будь первым кто запишется.`
    : null;

  return (
    <div className="pb-24 max-w-md mx-auto">
      <div className="sticky top-0 z-10 glass-strong px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-foreground font-semibold truncate flex-1">{event.title}</h2>
        {event.temperature === 'hot' && <Flame className="w-5 h-5 text-hot" />}
      </div>

      <div className="px-4 pt-4 space-y-4 animate-fade-up">
        <div className="space-y-2">
          <span className="text-sm">{event.category}</span>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          <p className="text-muted-foreground text-sm">{event.description}</p>
        </div>

        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{event.location}</span>
          </div>
          <p className="text-xs text-muted-foreground pl-6">{event.address}</p>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{event.date}, {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className={event.temperature === 'hot' ? 'text-hot font-semibold' : event.temperature === 'warm' ? 'text-foreground' : 'text-muted-foreground'}>
              интересуются: {interest} человек
            </span>
          </div>
        </div>

        {coldMessage && (
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">{coldMessage}</p>
          </div>
        )}

        <button
          onClick={() => {
            if (!isAuthenticated) {
              requestAuth('Чтобы записаться — войди за 10 секунд');
            }
          }}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
            event.temperature === 'hot'
              ? 'bg-hot text-primary-foreground animate-pulse-glow'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          Я иду 🙌
        </button>

        <div>
          <h3 className="text-foreground font-semibold mb-3">Кто идёт</h3>
          <div className="space-y-2">
            {attendees.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
