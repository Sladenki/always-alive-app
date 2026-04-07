import { mockEvents, getInterestCount, mockPlaces, getPlaceById } from '@/data/mockData';
import { Flame, Coffee, Trees, GraduationCap, MapPin, Fish, Bug, Route } from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppState } from '@/contexts/AppStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import type { EventData, CityPlaceData } from '@/data/types';
import { interestNumberClass } from '@/lib/interestText';
import DayHistorySheet from '@/components/DayHistorySheet';
import PlaceCheckInFlowOverlay from '@/components/PlaceCheckInFlowOverlay';
import { buildPlaceMarkerHtml } from '@/lib/placeMarkerHtml';
import { sortStopsByTime } from '@/lib/dayRoute';
import { cn } from '@/lib/utils';

export interface MapIntent {
  placeId: string;
  openSheet?: boolean;
}

interface MapPageProps {
  onEventClick: (id: string) => void;
  mapIntent?: MapIntent | null;
  onConsumeMapIntent?: () => void;
}

const CENTER: [number, number] = [54.7104, 20.481];

interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const LANDMARKS: Landmark[] = [
  { id: 'kant-island', name: 'Остров Канта', lat: 54.7067, lng: 20.5115 },
  { id: 'city-center', name: 'Центр города', lat: 54.7198, lng: 20.5036 },
];

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

function placeMarkerIcon(place: CityPlaceData, visitCount: number) {
  const html = buildPlaceMarkerHtml(place, visitCount);
  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

function landmarkIcon() {
  const html = `
<div style="position:relative;display:flex;align-items:center;justify-content:center;width:20px;height:20px">
  <div style="width:12px;height:12px;border-radius:9999px;background:#facc15;border:2px solid #1f2937;box-shadow:0 0 0 2px rgba(250,204,21,0.25)"></div>
</div>`;
  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/** Номер шага на линии маршрута дня */
function routeStepIcon(step: number) {
  const html = `
<div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:9999px;background:#7c3aed;border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 10px rgba(124,58,237,0.5);font-size:11px;font-weight:700;color:#fff">${step}</div>`;
  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function MapFlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 0.75 });
  }, [center, map]);
  return null;
}

/** Dev mode: click map to set simulated position */
function DevMapClickHandler() {
  const { devMode, devSetPosition } = useLocation();
  useMapEvents({
    click(e) {
      if (devMode) {
        devSetPosition(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function userPosIcon() {
  const html = `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 12px rgba(59,130,246,0.6)"></div>`;
  return L.divIcon({ html, className: 'map-marker-wrap', iconSize: [16, 16], iconAnchor: [8, 8] });
}

function categoryPlaceIcon(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('кофейн') || c.includes('антикафе')) return Coffee;
  if (c.includes('парк')) return Trees;
  if (c.includes('вуз')) return GraduationCap;
  if (c.includes('рыбн') || c.includes('район')) return Fish;
  return MapPin;
}

export default function MapPage({ onEventClick, mapIntent, onConsumeMapIntent }: MapPageProps) {
  const [mapMode, setMapMode] = useState<'events' | 'places'>('events');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(null);
  const [checkIn, setCheckIn] = useState<{ place: CityPlaceData; live: boolean } | null>(null);
  const [dayHistoryOpen, setDayHistoryOpen] = useState(false);

  const { signUpForEvent, isSignedUp, getPlaceVisitCount, placeVisitCounts } = useAppState();
  const { requestAuth, isAuthenticated } = useAuth();
  const loc = useLocation();

  // Track map opens
  useEffect(() => {
    loc.incrementMapOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userPosMarkerIcon = useMemo(() => userPosIcon(), []);

  const iconById = useMemo(() => {
    const m: Record<string, L.DivIcon> = {};
    mockEvents.forEach((e, i) => {
      m[e.id] = sonarDivIcon(e, i);
    });
    return m;
  }, []);

  const placeIconById = useMemo(() => {
    const m: Record<string, L.DivIcon> = {};
    mockPlaces.forEach((p) => {
      const vc = placeVisitCounts[p.id] ?? 0;
      m[p.id] = placeMarkerIcon(p, vc);
    });
    return m;
  }, [placeVisitCounts]);
  const orientationLandmarkIcon = useMemo(() => landmarkIcon(), []);

  const dayRoute = useMemo(() => {
    const sorted = sortStopsByTime(loc.todayStops);
    const positions = sorted.map((s) => [s.lat, s.lng] as [number, number]);
    return { sorted, positions };
  }, [loc.todayStops]);

  const routeStepIcons = useMemo(() => {
    return dayRoute.sorted.map((_, i) => routeStepIcon(i + 1));
  }, [dayRoute.sorted]);

  useEffect(() => {
    if (!mapIntent?.placeId) return;
    const pl = getPlaceById(mapIntent.placeId);
    if (pl) setFlyCenter([pl.lat, pl.lng]);
    setMapMode('places');
    if (mapIntent.openSheet) setSelectedPlaceId(mapIntent.placeId);
    onConsumeMapIntent?.();
  }, [mapIntent, onConsumeMapIntent]);

  const selected = selectedId ? mockEvents.find((e) => e.id === selectedId) : undefined;
  const selectedPlace = selectedPlaceId ? getPlaceById(selectedPlaceId) : undefined;
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

  const openCheckIn = (place: CityPlaceData, live: boolean) => {
    if (!isAuthenticated) {
      requestAuth('Чтобы отметиться — войди за 10 секунд');
      return;
    }
    setSelectedPlaceId(null);
    setCheckIn({ place, live });
  };

  const PlaceCatIcon = selectedPlace ? categoryPlaceIcon(selectedPlace.category) : MapPin;
  const visits = selectedPlace ? getPlaceVisitCount(selectedPlace.id) : 0;

  return (
    <div className="relative h-[calc(100vh-60px)] w-full overflow-hidden">
      <div className="absolute top-2 left-0 right-0 z-[1100] flex justify-center px-3 pointer-events-none">
        <div className="pointer-events-auto flex rounded-full bg-[#1e2130]/95 border border-white/10 p-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMapMode('events')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]',
              mapMode === 'events' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            События
          </button>
          <button
            type="button"
            onClick={() => setMapMode('places')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]',
              mapMode === 'places' ? 'bg-teal-500 text-[#0f172a]' : 'text-muted-foreground',
            )}
          >
            Места
          </button>
        </div>
      </div>

      <MapContainer
        center={CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ background: 'hsl(230, 25%, 9%)' }}
        attributionControl={false}
      >
        <TileLayer 
        // url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <MapFlyTo center={flyCenter} />
        <DevMapClickHandler />
        {dayRoute.positions.length >= 2 && (
          <Polyline
            positions={dayRoute.positions}
            pathOptions={{
              color: '#a78bfa',
              weight: 4,
              opacity: 0.88,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
        {dayRoute.sorted.map((s, i) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={routeStepIcons[i]} zIndexOffset={850} />
        ))}
        {loc.currentPos && (
          <Marker position={loc.currentPos} icon={userPosMarkerIcon} zIndexOffset={900} />
        )}
        {LANDMARKS.map((landmark) => (
          <Marker
            key={landmark.id}
            position={[landmark.lat, landmark.lng]}
            icon={orientationLandmarkIcon}
            zIndexOffset={700}
            eventHandlers={{
              click: () => {
                setFlyCenter([landmark.lat, landmark.lng]);
              },
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              opacity={0.95}
              className="!bg-[#111827]/90 !text-white !border !border-white/20 !rounded-md !px-2 !py-1 !text-[11px] !font-semibold"
            >
              {landmark.name}
            </Tooltip>
          </Marker>
        ))}
        {mapMode === 'events' &&
          mockEvents.map((event) => (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              icon={iconById[event.id]}
              eventHandlers={{
                click: () => {
                  setSelectedPlaceId(null);
                  setSelectedId(event.id);
                },
              }}
            />
          ))}
        {mapMode === 'places' &&
          mockPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={placeIconById[place.id]}
              eventHandlers={{
                click: () => {
                  setSelectedId(null);
                  setSelectedPlaceId(place.id);
                },
              }}
            />
          ))}
      </MapContainer>

      {loc.todayStops.length > 0 && (
        <button
          type="button"
          onClick={() => setDayHistoryOpen(true)}
          className="absolute bottom-[7.25rem] left-3 z-[1100] flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-2xl bg-[#1e2130]/95 border border-violet-500/30 text-violet-200 text-xs font-semibold shadow-lg backdrop-blur-md pointer-events-auto active:scale-[0.98] transition-transform"
        >
          <Route className="w-4 h-4 shrink-0 text-violet-400" />
          История дня
        </button>
      )}

      <Sheet open={dayHistoryOpen} onOpenChange={setDayHistoryOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="z-[2100]"
          className="z-[2100] max-h-[82vh] overflow-y-auto max-w-md mx-auto left-0 right-0 rounded-t-3xl bg-[#161a28] border border-white/[0.06] pb-28 pt-2 data-[state=open]:!animate-none shadow-[0_-20px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden />
          <SheetHeader className="sr-only">
            <SheetTitle>История дня</SheetTitle>
          </SheetHeader>
          <DayHistorySheet sorted={dayRoute.sorted} />
        </SheetContent>
      </Sheet>

      <div className="absolute bottom-16 left-0 right-0 px-4 z-[1000]">
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {mapMode === 'events'
            ? mockEvents.slice(0, 4).map((event) => (
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
              ))
            : mockPlaces.slice(0, 5).map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlaceId(place.id);
                    setFlyCenter([place.lat, place.lng]);
                  }}
                  className="glass-strong rounded-xl p-3 min-w-[180px] shrink-0 text-left border border-teal-500/20 transition-transform active:scale-[0.96] duration-150"
                >
                  <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                    <span>{place.icon}</span> {place.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {place.totalBeenHere} были здесь
                  </p>
                </button>
              ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="z-[2000]"
          className="map-event-sheet z-[2000] max-h-[85vh] overflow-y-auto max-w-md mx-auto left-0 right-0 rounded-t-2xl bg-[#1e2130] border-border pb-24 data-[state=open]:!animate-none"
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
                <span className={`tabular-nums ${interestNumberClass(interest)}`}>{interest}</span> человек
                идут
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

      <Sheet open={!!selectedPlace} onOpenChange={(o) => !o && setSelectedPlaceId(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="z-[2000]"
          className="map-place-sheet z-[2000] max-h-[85vh] overflow-y-auto max-w-md mx-auto left-0 right-0 rounded-t-2xl bg-[#1e2130] border-border pb-24 data-[state=open]:!animate-none"
        >
          {selectedPlace && (
            <>
              <SheetHeader className="text-left space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <PlaceCatIcon className="w-5 h-5" />
                  </div>
                  <SheetTitle className="text-lg">{selectedPlace.name}</SheetTitle>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPlace.category}</p>
              </SheetHeader>

              <p className="text-sm text-foreground mt-4">
                <span className="font-semibold tabular-nums">{selectedPlace.totalBeenHere}</span> человек
                были здесь
              </p>

              {selectedPlace.hereNow && (
                <p className="mt-2 text-sm font-medium text-green-400">
                  {selectedPlace.hereNow.name} здесь прямо сейчас 🟢
                </p>
              )}

              <div className="flex gap-2 mt-4">
                {selectedPlace.recentPeople.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {p.name[0]}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground truncate max-w-[56px]">
                      {p.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-3">Твои визиты: {visits}</p>

              <button
                type="button"
                onClick={() => openCheckIn(selectedPlace, true)}
                className="mt-6 w-full py-3.5 rounded-xl bg-teal-500 text-[#0f172a] font-semibold transition-transform active:scale-[0.97]"
              >
                Я здесь
              </button>
              <button
                type="button"
                onClick={() => openCheckIn(selectedPlace, false)}
                className="mt-3 w-full py-2.5 text-sm text-muted-foreground font-medium transition-transform active:scale-[0.98]"
              >
                Был здесь раньше
              </button>
            </>
          )}
        </SheetContent>
      </Sheet>

      {checkIn && (
        <PlaceCheckInFlowOverlay
          place={checkIn.place}
          liveCheckIn={checkIn.live}
          open
          onClose={() => setCheckIn(null)}
        />
      )}

      {/* Dev mode toggle */}
      <button
        type="button"
        onClick={() => loc.setDevMode(!loc.devMode)}
        className={cn(
          'absolute bottom-20 right-3 z-[1100] w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
          loc.devMode
            ? 'bg-violet-600 text-white'
            : 'bg-card/80 border border-border text-muted-foreground',
        )}
        title="Dev Mode"
      >
        <Bug className="w-4 h-4" />
      </button>
    </div>
  );
}
