import { mockEvents, getInterestCount } from '@/data/mockData';
import { Flame } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPageProps {
  onEventClick: (id: string) => void;
}

const CENTER: [number, number] = [54.7104, 20.4810];

export default function MapPage({ onEventClick }: MapPageProps) {
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {mockEvents.map((event) => {
          const interest = getInterestCount(event);
          const isHot = event.temperature === 'hot';
          const isWarm = event.temperature === 'warm';
          const color = isHot ? '#e8622c' : isWarm ? '#d4921a' : '#64748b';

          return (
            <CircleMarker
              key={event.id}
              center={[event.lat, event.lng]}
              radius={isHot ? 14 : isWarm ? 10 : 7}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.7,
                color: color,
                weight: 2,
                opacity: 0.9,
              }}
              eventHandlers={{ click: () => onEventClick(event.id) }}
            >
              <Popup className="dark-popup">
                <div className="text-sm font-semibold">{event.title}</div>
                <div className="text-xs opacity-70">{event.time} · {interest} чел.</div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Bottom event strip */}
      <div className="absolute bottom-16 left-0 right-0 px-4 z-[1000]">
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {mockEvents.slice(0, 4).map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="glass-strong rounded-xl p-3 min-w-[200px] shrink-0 text-left"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {event.temperature === 'hot' && <Flame className="w-3 h-3 text-hot" />}
                <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{event.time} · {event.location}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
