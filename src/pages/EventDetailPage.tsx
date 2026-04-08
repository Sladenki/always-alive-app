import { mockEvents, getInterestCount, getAttendeesWithPlaceholders } from '@/data/mockData';
import { interestNumberClass } from '@/lib/interestText';
import { eventImages } from '@/data/eventImages';
import PersonCard from '@/components/PersonCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { ArrowLeft, MapPin, Clock, Users, Flame, Check } from 'lucide-react';
import { toast } from 'sonner';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
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
  const acquaintances = getAcquaintancesForEvent(event.id);

  const coldMessage = event.realSignups === 0
    ? `👀 ${interest} человек смотрят. Будь первым.`
    : null;

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
      {/* Header */}
      {image ? (
        <div className="relative h-56 w-full overflow-hidden">
          <img src={image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <button
            onClick={onBack}
            className="absolute top-4 left-4 glass-strong rounded-full p-2.5 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          {event.temperature === 'hot' && (
            <div className="absolute top-4 right-4">
              <Flame className="w-6 h-6 text-hot drop-shadow-lg" />
            </div>
          )}
        </div>
      ) : (
        <div className="sticky top-0 z-10 glass-solid px-4 py-3.5 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-foreground font-semibold truncate flex-1">{event.title}</h2>
        </div>
      )}

      <div className="px-4 pt-5 space-y-4 animate-fade-up">
        {/* Acquaintances */}
        {acquaintances.length > 0 && (
          <div className="rounded-2xl glass p-4 space-y-3" style={{ borderColor: 'hsl(var(--violet) / 0.2)' }}>
            <h3 className="text-foreground font-semibold text-sm">Ваши знакомства здесь</h3>
            <div className="space-y-2.5">
              {acquaintances.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-violet/20 flex items-center justify-center text-sm font-bold text-foreground">
                    {initials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast('Чат скоро появится')}
                    className="text-sm font-semibold text-violet shrink-0 active:scale-95 transition-transform"
                  >
                    Написать
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-2">
          <span className="text-sm">{event.category}</span>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{event.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
        </div>

        {/* Details card */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span>{event.location}</span>
              <p className="text-xs text-muted-foreground">{event.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{event.date}, {event.time}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className={interestNumberClass(interest)}>
              <span className="tabular-nums">{interest}</span> интересуются
            </span>
          </div>
        </div>

        {coldMessage && (
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">{coldMessage}</p>
          </div>
        )}

        {/* CTA */}
        {going ? (
          <div className="w-full py-3.5 rounded-2xl bg-primary/15 text-primary font-semibold flex items-center justify-center gap-2 text-[15px]">
            <Check className="w-5 h-5" />
            Ты идёшь! 🎉
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignUp}
            className={`w-full py-4 rounded-2xl font-semibold text-[15px] transition-all duration-150 active:scale-[0.97] ${
              event.temperature === 'hot'
                ? 'bg-hot text-primary-foreground shadow-[0_4px_20px_hsl(var(--hot)/0.3)]'
                : 'bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.25)] hover:shadow-[0_6px_28px_hsl(var(--primary)/0.35)]'
            }`}
          >
            Я иду 🙌
          </button>
        )}

        {/* Attendees */}
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
