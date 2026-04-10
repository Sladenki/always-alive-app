import { EventData, EventTemperature } from '@/data/types';
import { getInterestCount } from '@/data/mockData';
import { eventImages } from '@/data/eventImages';
import { useAppState } from '@/contexts/AppStateContext';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { interestNumberClass } from '@/lib/interestText';
import { Flame, Users, Check } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

interface EventCardProps {
  event: EventData;
  onClick: () => void;
  index?: number;
  revealOnScroll?: boolean;
}

const tempCta: Record<EventTemperature, string> = {
  cold: 'Будь первым из друзей',
  warm: 'Написать кому-то',
  hot: '',
};

function gradientFallbackBg(id: string): string {
  const hues = [262, 200, 168, 220, 32, 300];
  let s = 0;
  for (let i = 0; i < id.length; i++) s += id.charCodeAt(i);
  const h = hues[s % hues.length];
  const h2 = (h + 48) % 360;
  return `linear-gradient(145deg, hsl(${h} 42% 22%) 0%, hsl(${h2} 38% 12%) 100%)`;
}

export default function EventCard({ event, onClick, index = 0, revealOnScroll = true }: EventCardProps) {
  const interest = getInterestCount(event);
  const image = eventImages[event.id];
  const isHot = event.temperature === 'hot' || event.realSignups >= 20;
  const { isSignedUp } = useAppState();
  const going = isSignedUp(event.id);
  const { ref, visible: inView } = useInViewOnce<HTMLButtonElement>();
  const visible = revealOnScroll ? inView : true;
  const [didPop, setDidPop] = useState(false);

  useEffect(() => {
    if (visible) setDidPop(true);
  }, [visible]);

  const cta = isHot
    ? `${event.realSignups}+ идут — присоединяйся`
    : tempCta[event.temperature];

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{ '--reveal-delay': `${index * 0.08}s` } as CSSProperties}
      className={`group relative w-full text-left rounded-2xl overflow-hidden transition-all duration-200
        glass glass-hover active:scale-[0.96]
        ${revealOnScroll ? `event-card-reveal ${visible ? 'is-visible' : ''}` : ''}
        ${isHot ? 'animate-hot-border-glow' : ''}`}
    >
      <div className="relative h-36 w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: gradientFallbackBg(event.id) }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {going ? (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
              <Check className="w-3 h-3" /> Иду
            </span>
          ) : (
            <span />
          )}
          {isHot && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-hot/20 text-hot flex items-center gap-1 backdrop-blur-sm">
              <Flame className="w-3 h-3" /> Горячо
            </span>
          )}
        </div>
      </div>

      <div className="p-4 pt-3 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-foreground/90">{event.category}</span>
          <span className="text-[12px] text-muted-foreground">
            {event.date} · {event.time}
          </span>
        </div>

        <h3 className="font-medium text-foreground text-[15px] leading-snug">
          {event.title}
        </h3>

        <p className="text-[14px] text-muted-foreground leading-relaxed">{event.location}</p>

        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className={`text-[13px] leading-relaxed ${interestNumberClass(interest)}`}>
              интересуются:{' '}
              <span className={`tabular-nums font-medium ${didPop ? 'interest-pop-once' : ''}`}>{interest}</span>
            </span>
          </div>
          {cta && (
            <p className="text-[11px] text-muted-foreground/80 italic shrink-0 max-w-[45%] text-right">{cta}</p>
          )}
        </div>
      </div>
    </button>
  );
}
