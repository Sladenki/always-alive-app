import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { mockPlaces } from '@/data/mockData';
import type { CityPlaceData } from '@/data/types';

/* ────── Types ────── */

export interface DetectedStop {
  id: string;
  lat: number;
  lng: number;
  /** Название — настоящее или сгенерённое */
  label: string;
  /** Время начала остановки */
  startTime: Date;
  /** Длительность в минутах */
  durationMin: number;
  /** Совпавшее место из базы */
  matchedPlace?: CityPlaceData;
  /** Подтвержден / отклонён / ожидает */
  status: 'pending' | 'confirmed' | 'dismissed';
  /** Эмоция пользователя */
  mood?: string;
}

export type LocationMode = 'basic' | 'smart';

interface LocationContextType {
  mode: LocationMode;
  setMode: (m: LocationMode) => void;

  /** Текущая позиция (реальная или симулированная) */
  currentPos: [number, number] | null;

  /** Разрешил ли пользователь гео */
  geoGranted: boolean;
  requestGeo: () => void;

  /** Засечённые «остановки» за сегодня */
  todayStops: DetectedStop[];
  confirmStop: (id: string, mood?: string) => void;
  dismissStop: (id: string) => void;

  /** Показывать ли Evening Recall */
  showEveningRecall: boolean;
  setShowEveningRecall: (v: boolean) => void;

  /** Показывать ли предложение включить умный режим */
  shouldPromptSmart: boolean;
  dismissSmartPrompt: () => void;

  /** DEV MODE */
  devMode: boolean;
  setDevMode: (v: boolean) => void;
  devSetPosition: (lat: number, lng: number) => void;
  devGenerateDay: () => void;

  /** Счётчики для триггера промпта */
  checkinCount: number;
  mapOpenCount: number;
  incrementMapOpen: () => void;
  incrementCheckin: () => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

/* ────── Helpers ────── */

const KALININGRAD_CENTER: [number, number] = [54.7104, 20.481];

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const sa = Math.sin(dLat / 2);
  const sb = Math.sin(dLon / 2);
  const h =
    sa * sa +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * sb * sb;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function findNearestPlace(lat: number, lng: number): CityPlaceData | undefined {
  let best: CityPlaceData | undefined;
  let bestDist = Infinity;
  for (const p of mockPlaces) {
    const d = haversineKm([lat, lng], [p.lat, p.lng]);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return bestDist < 0.3 ? best : undefined; // 300m
}

function generateApproxLabel(lat: number, lng: number): string {
  const labels = [
    'Кофейня рядом с каналом',
    'Уютное место в центре',
    'Тихий дворик',
    'Скамейка у озера',
    'Точка возле парка',
    'Магазин на углу',
    'Кафе на набережной',
  ];
  const idx = Math.abs(Math.round(lat * 1000 + lng * 1000)) % labels.length;
  return labels[idx];
}

function randomKaliningradPoint(): [number, number] {
  const lat = 54.7 + (Math.random() - 0.5) * 0.04;
  const lng = 20.48 + (Math.random() - 0.5) * 0.06;
  return [lat, lng];
}

/* ────── Provider ────── */

export function LocationProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LocationMode>('basic');
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [geoGranted, setGeoGranted] = useState(false);
  const [todayStops, setTodayStops] = useState<DetectedStop[]>([]);
  const [showEveningRecall, setShowEveningRecall] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [checkinCount, setCheckinCount] = useState(0);
  const [mapOpenCount, setMapOpenCount] = useState(0);
  const [smartPromptDismissed, setSmartPromptDismissed] = useState(false);
  const watchRef = useRef<number | null>(null);

  const shouldPromptSmart =
    !smartPromptDismissed &&
    mode === 'basic' &&
    (checkinCount >= 1 || mapOpenCount >= 3);

  const requestGeo = useCallback(() => {
    if (devMode) {
      setGeoGranted(true);
      setCurrentPos(KALININGRAD_CENTER);
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setGeoGranted(true);
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        /* denied — stay without */
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [devMode]);

  // Smart mode: watch position
  useEffect(() => {
    if (mode !== 'smart' || !geoGranted || devMode) return;
    const id = navigator.geolocation?.watchPosition(
      (pos) => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false },
    );
    watchRef.current = id ?? null;
    return () => {
      if (watchRef.current != null) navigator.geolocation?.clearWatch(watchRef.current);
    };
  }, [mode, geoGranted, devMode]);

  // Evening recall trigger
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 18 && todayStops.length > 0 && todayStops.some((s) => s.status === 'pending')) {
      setShowEveningRecall(true);
    }
  }, [todayStops]);

  const addStop = useCallback(
    (lat: number, lng: number, durMin: number) => {
      const matched = findNearestPlace(lat, lng);
      const label = matched ? matched.name : generateApproxLabel(lat, lng);
      const stop: DetectedStop = {
        id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        lat,
        lng,
        label,
        startTime: new Date(Date.now() - durMin * 60000),
        durationMin: durMin,
        matchedPlace: matched,
        status: 'pending',
      };
      setTodayStops((prev) => [stop, ...prev]);
    },
    [],
  );

  const confirmStop = useCallback((id: string, mood?: string) => {
    setTodayStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'confirmed' as const, mood } : s)),
    );
  }, []);

  const dismissStop = useCallback((id: string) => {
    setTodayStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'dismissed' as const } : s)),
    );
  }, []);

  const devSetPosition = useCallback(
    (lat: number, lng: number) => {
      setCurrentPos([lat, lng]);
      setGeoGranted(true);
      // Auto-detect stop when clicking in dev mode
      addStop(lat, lng, Math.floor(10 + Math.random() * 50));
    },
    [addStop],
  );

  const devGenerateDay = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 3);
    const now = new Date();
    const stops: DetectedStop[] = [];
    for (let i = 0; i < count; i++) {
      const [lat, lng] = randomKaliningradPoint();
      const matched = findNearestPlace(lat, lng);
      const dur = 10 + Math.floor(Math.random() * 80);
      const startMs = now.getTime() - (count - i) * 3600000 + Math.random() * 1800000;
      stops.push({
        id: `dev-${Date.now()}-${i}`,
        lat,
        lng,
        label: matched ? matched.name : generateApproxLabel(lat, lng),
        startTime: new Date(startMs),
        durationMin: dur,
        matchedPlace: matched,
        status: 'pending',
      });
    }
    stops.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    setTodayStops(stops);
    setShowEveningRecall(true);
  }, []);

  const incrementMapOpen = useCallback(() => setMapOpenCount((c) => c + 1), []);
  const incrementCheckin = useCallback(() => setCheckinCount((c) => c + 1), []);

  return (
    <LocationContext.Provider
      value={{
        mode,
        setMode,
        currentPos,
        geoGranted,
        requestGeo,
        todayStops,
        confirmStop,
        dismissStop,
        showEveningRecall,
        setShowEveningRecall,
        shouldPromptSmart,
        dismissSmartPrompt: () => setSmartPromptDismissed(true),
        devMode,
        setDevMode,
        devSetPosition,
        devGenerateDay,
        checkinCount,
        mapOpenCount,
        incrementMapOpen,
        incrementCheckin,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
