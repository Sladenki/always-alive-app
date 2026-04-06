import { mockEvents, getInterestCount, getAttendeesWithPlaceholders } from '@/data/mockData';
import { interestNumberClass } from '@/lib/interestText';
import { eventImages } from '@/data/eventImages';
import PersonCard from '@/components/PersonCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { ArrowLeft, MapPin, Clock, Eye, Flame, Check } from 'lucide-react';
import { toast } from 'sonner';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  /** After successful «Я иду» — show match moment (prototype) */
  onMatchOpen?: (eventId: string) => void;
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function EventDetailPage({ eventId, onBack, onMatchOpen }: EventDetailPageProps) {
  const event = mockEvents.find(e => e.id === eventId);
  const { requestAuth, isAuthenticated } = useAuth();
  const { signUpForEvent, isSignedUp, getAcquaintancesForEvent } = useAppState();

  if (!event) return null;

  const interest = getInterestCount(event);
  const attendees = getAttendeesWithPlaceholders(event);
  const image = eventImages[event.id];
  const going = isSignedUp(event.id);

  const coldMessage = event.realSignups === 0
    ? `👀 ${interest} человек смотрят это событие. Будь первым кто запишется.`
    : null;

  const acquaintances = getAcquaintancesForEvent(event.id);

  const handleSignUp = () => {
    if (!isAuthenticated) {
      requestAuth('Чтобы записаться — войди за 10 секунд');
      return;
    }
    signUpForEvent(event.id);
    onMatchOpen?.(event.id);
  };

  return (
    <div className="pb-24 max-w-md mx-auto">
      {/* Header image */}
      {image && (
        <div className="relative h-52 w-full overflow-hidden">
          <img src={image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <button onClick={onBack} className="absolute top-4 left-4 glass rounded-full p-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          {event.temperature === 'hot' && (
            <div className="absolute top-4 right-4">
              <Flame className="w-6 h-6 text-hot drop-shadow-lg" />
            </div>
          )}
        </div>
      )}

      {!image && (
        <div className="sticky top-0 z-10 glass-strong px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-foreground font-semibold truncate flex-1">{event.title}</h2>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4 animate-fade-up">
        {acquaintances.length > 0 && (
          <div className="rounded-xl border border-[#7c3aed]/35 bg-[#7c3aed]/10 p-4 space-y-3">
            <h3 className="text-foreground font-semibold text-sm">Ваши знакомства на этом событии</h3>
            <div className="space-y-2">
              {acquaintances.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#7c3aed]/40 flex items-center justify-center text-base font-bold text-white">
                    {initials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast('Чат скоро появится')}
                    className="text-sm font-semibold text-[#7c3aed] shrink-0 active:scale-[0.97] transition-transform"
                  >
                    Написать
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <span className={interestNumberClass(interest)}>
              интересуются: <span className="tabular-nums">{interest}</span> человек
            </span>
          </div>
        </div>

        {coldMessage && (
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">{coldMessage}</p>
          </div>
        )}

        {going ? (
          <div className="w-full py-3.5 rounded-xl bg-primary/20 text-primary font-semibold flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Ты идёшь! 🎉
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignUp}
            className={`w-full py-3.5 rounded-xl font-semibold transition-[transform,filter] duration-150 active:scale-[0.96] active:brightness-110 ${
              event.temperature === 'hot'
                ? 'bg-hot text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            Я иду 🙌
          </button>
        )}

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
