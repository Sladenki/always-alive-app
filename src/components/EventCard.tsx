import { EventData, EventTemperature } from '@/data/types';
import { getInterestCount } from '@/data/mockData';
import { Flame, Eye } from 'lucide-react';

interface EventCardProps {
  event: EventData;
  onClick: () => void;
  index?: number;
}

const tempStyles: Record<EventTemperature, { badge: string; counter: string; cta: string }> = {
  cold: {
    badge: '',
    counter: 'text-muted-foreground',
    cta: 'Будь первым из своих друзей',
  },
  warm: {
    badge: '',
    counter: 'text-foreground',
    cta: 'Написать кому-то',
  },
  hot: {
    badge: 'bg-hot/20 text-hot',
    counter: 'text-hot',
    cta: '',
  },
};

export default function EventCard({ event, onClick, index = 0 }: EventCardProps) {
  const interest = getInterestCount(event);
  const style = tempStyles[event.temperature];
  const hotCta = `Уже идут ${event.realSignups}+ человек — присоединяйся`;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass rounded-xl p-4 animate-fade-up transition-all hover:border-primary/30 ${
        event.temperature === 'hot' ? 'animate-pulse-glow' : ''
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{event.category}</span>
            {event.temperature === 'hot' && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${style.badge}`}>
                <Flame className="w-3 h-3" /> Горячо
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-base leading-tight mb-1 truncate">{event.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{event.location} · {event.time}</p>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={`text-xs font-medium ${style.counter}`}>
              интересуются: {interest} человек
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground">{event.date}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 italic">
        {event.temperature === 'hot' ? hotCta : style.cta}
      </p>
    </button>
  );
}
