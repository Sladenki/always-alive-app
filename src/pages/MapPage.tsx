import { mockEvents, getInterestCount } from '@/data/mockData';
import { Flame } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppState } from '@/contexts/AppStateContext';
import { useAuth } from '@/contexts/AuthContext';
import type { EventData } from '@/data/types';
import { interestNumberClass } from '@/lib/interestText';

interface MapPageProps {
  onEventClick: (id: string) => void;
}

const CENTER: [number, number] = [54.7104, 20.481];

function sonarDivIcon(event: EventData, index: number) {
  const isHot = event.temperature === 'hot';
  const isWarm = event.temperature === 'warm';
  const color = isHot ? '#e8622c' : isWarm ? '#d4921a' : '#64748b';
  const pulseDur = isHot ? 1.5 : 2;
  const delay = ((index * 0.37) % 1.75).toFixed(2);
  const dot = isHot ? 18 : isWarm ? 14 : 12;
  const half = dot / 2;
  const label = isHot
    ? '<div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:11px;line-height:1;pointer-events:none;white-space:nowrap">🔥</div>'
    : '';

  const html = `
<div class="map-marker-inner" style="position:relative;width:56px;height:56px;color:${color};--sonar-dur:${pulseDur}s;--sonar-delay:${delay}s">
  ${label}
  <div class="map-sonar-burst"></div>
  <div class="map-sonar-burst map-sonar-burst--late"></div>
  <div style="position:absolute;left:50%;top:50%;width:${dot}px;height:${dot}px;margin-left:${-half}px;margin-top:${-half}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.35);box-shadow:0 0 12px rgba(0,0,0,0.35)"></div>
</div>`;

  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
}

export default function MapPage({ onEventClick }: MapPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { signUpForEvent, isSignedUp } = useAppState();
  const { requestAuth, isAuthenticated } = useAuth();

  const iconById = useMemo(() => {
    const m: Record<string, L.DivIcon> = {};
    mockEvents.forEach((e, i) => {
      m[e.id] = sonarDivIcon(e, i);
    });
    return m;
  }, []);

  const selected = selectedId ? mockEvents.find((e) => e.id === selectedId) : undefined;
  const interest = selected ? getInterestCount(selected) : 0;
  const going = selected ? isSignedUp(selected.id) : false;

  const handleGoing = () => {
    if (!selected) return;
    if (!isAuthenticated) {
      requestAuth('Чтобы записаться — войди за 10 секунд');
      return;
    }
    signUpForEvent(selected.id);
    setSelectedId(null);
  };

  return (
    <div className="relative h-[calc(100vh-60px)] w-full overflow-hidden">
      <MapContainer
        center={CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ background: 'hsl(230, 25%, 9%)' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {mockEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={iconById[event.id]}
            eventHandlers={{
              click: () => {
                setSelectedId(event.id);
              },
            }}
          />
        ))}
      </MapContainer>

      <div className="absolute bottom-16 left-0 right-0 px-4 z-[1000]">
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {mockEvents.slice(0, 4).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventClick(event.id)}
              className="glass-strong rounded-xl p-3 min-w-[200px] shrink-0 text-left transition-transform active:scale-[0.96] duration-150 active:brightness-110"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {event.temperature === 'hot' && <Flame className="w-3 h-3 text-hot" />}
                <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {event.time} · {event.location}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent
          side="bottom"
          className="map-event-sheet max-w-md mx-auto left-0 right-0 rounded-t-2xl bg-[#1e2130] border-border [&>button]:hidden pb-8 data-[state=open]:!animate-none"
        >
          {selected && (
            <>
              <SheetHeader className="text-left space-y-1 pr-8">
                <SheetTitle className="text-lg">{selected.title}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {selected.date}, {selected.time}
                </p>
              </SheetHeader>
              <p className="text-sm text-foreground mt-4">
                <span className={`tabular-nums ${interestNumberClass(interest)}`}>{interest}</span> человек идут
              </p>
              {going ? (
                <p className="mt-4 text-sm text-primary font-semibold">Ты уже в списке ✓</p>
              ) : (
                <button
                  type="button"
                  onClick={handleGoing}
                  className="mt-5 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-[transform,filter] duration-150 active:scale-[0.96] active:brightness-110"
                >
                  Я иду
                </button>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
