import { mockEvents, getInterestCount } from '@/data/mockData';
import { Flame } from 'lucide-react';

interface MapPageProps {
  onEventClick: (id: string) => void;
}

export default function MapPage({ onEventClick }: MapPageProps) {
  return (
    <div className="relative h-[calc(100vh-60px)] w-full overflow-hidden">
      {/* Stylized map background */}
      <div className="absolute inset-0 bg-[hsl(230,25%,9%)]">
        {/* Grid lines to simulate map */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h${i}`} className="absolute w-full h-px bg-foreground" style={{ top: `${i * 5}%` }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v${i}`} className="absolute h-full w-px bg-foreground" style={{ left: `${i * 5}%` }} />
          ))}
        </div>
        {/* Water areas */}
        <div className="absolute w-32 h-20 rounded-full bg-primary/5 top-[20%] left-[15%] rotate-12" />
        <div className="absolute w-48 h-16 rounded-full bg-primary/5 top-[60%] left-[40%] -rotate-6" />

        {/* City label */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2">
          <p className="text-xs text-muted-foreground/40 tracking-[0.3em] uppercase">Калининград</p>
        </div>
      </div>

      {/* Event dots */}
      {mockEvents.map((event, i) => {
        const interest = getInterestCount(event);
        const x = 15 + (i * 12) % 70;
        const y = 20 + ((i * 17 + 5) % 55);
        const isHot = event.temperature === 'hot';
        const isWarm = event.temperature === 'warm';

        return (
          <button
            key={event.id}
            onClick={() => onEventClick(event.id)}
            className="absolute group"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse ring */}
            <div className={`absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-dot ${
              isHot ? 'bg-hot/30' : isWarm ? 'bg-primary/30' : 'bg-muted-foreground/20'
            }`} />
            {/* Dot */}
            <div className={`relative w-4 h-4 rounded-full border-2 ${
              isHot ? 'bg-hot border-hot/50 shadow-[0_0_12px_hsl(var(--hot)/0.5)]'
              : isWarm ? 'bg-primary border-primary/50 shadow-[0_0_8px_hsl(var(--primary)/0.3)]'
              : 'bg-muted-foreground border-muted-foreground/50'
            }`}>
              {isHot && <Flame className="absolute -top-3 -right-3 w-3 h-3 text-hot" />}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-strong rounded-lg px-3 py-2 min-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
              <p className="text-[10px] text-muted-foreground">{event.time} · {interest} чел.</p>
            </div>
          </button>
        );
      })}

      {/* Bottom event preview strip */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {mockEvents.slice(0, 4).map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="glass-strong rounded-xl p-3 min-w-[200px] shrink-0 text-left"
            >
              <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
              <p className="text-[10px] text-muted-foreground">{event.time} · {event.location}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
