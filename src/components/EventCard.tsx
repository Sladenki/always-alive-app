import { EventData, EventTemperature } from '@/data/types';
import { getInterestCount } from '@/data/mockData';
import { eventImages } from '@/data/eventImages';
import { useAppState } from '@/contexts/AppStateContext';
import { Flame, Eye, Check } from 'lucide-react';

interface EventCardProps {
  event: EventData;
  onClick: () => void;
  index?: number;
}

const tempStyles: Record<EventTemperature, { badge: string; counter: string; cta: string }> = {
  cold: { badge: '', counter: 'text-muted-foreground', cta: 'Будь первым из своих друзей' },
  warm: { badge: '', counter: 'text-foreground', cta: 'Написать кому-то' },
  hot: { badge: 'bg-hot/20 text-hot', counter: 'text-hot', cta: '' },
};

export default function EventCard({ event, onClick, index = 0 }: EventCardProps) {
  const interest = getInterestCount(event);
  const style = tempStyles[event.temperature];
  const hotCta = `Уже идут ${event.realSignups}+ человек — присоединяйся`;
  const image = eventImages[event.id];
  const { isSignedUp } = useAppState();
  const going = isSignedUp(event.id);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass rounded-xl overflow-hidden animate-fade-up transition-all hover:border-primary/30 ${
        event.temperature === 'hot' ? 'animate-pulse-glow' : ''
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {image && (
        <div className="relative h-32 w-full overflow-hidden">
          <img src={image} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          {event.temperature === 'hot' && (
            <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${style.badge}`}>
              <Flame className="w-3 h-3" /> Горячо
            </span>
          )}
          {going && (
            <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1">
              <Check className="w-3 h-3" /> Иду
            </span>
          )}
        </div>
      )}
      <div className="p-4 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{event.category}</span>
          <span className="text-xs text-muted-foreground">{event.date} · {event.time}</span>
        </div>
        <h3 className="font-semibold text-foreground text-base leading-tight mb-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{event.location}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={`text-xs font-medium ${style.counter}`}>
              интересуются: {interest}
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {event.temperature === 'hot' ? hotCta : style.cta}
          </p>
        </div>
      </div>
    </button>
  );
}
