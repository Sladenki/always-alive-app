/** Снимок маршрута «Мой день» для локального архива (демо) */

const STORAGE_KEY = 'nexus_saved_day_routes';

export const SAVED_DAYS_UPDATED_EVENT = 'nexus-saved-days-updated';

export interface SavedDayStopSummary {
  id: string;
  icon: string;
  label: string;
}

export interface SavedDayRouteEntry {
  id: string;
  savedAt: string;
  /** Дата «дня», за который сохранён маршрут (локальный календарный день) */
  dayDate: string;
  dateLabelRu: string;
  stopCount: number;
  stops: SavedDayStopSummary[];
}

function emitUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(SAVED_DAYS_UPDATED_EVENT));
  } catch {
    /* SSR */
  }
}

export function getSavedDayRoutes(): SavedDayRouteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDayRouteEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: SavedDayRouteEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  emitUpdated();
}

export function appendSavedDayRoute(stops: SavedDayStopSummary[]): SavedDayRouteEntry {
  const now = new Date();
  const dayDate = now.toISOString().slice(0, 10);
  const dateLabelRu = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const entry: SavedDayRouteEntry = {
    id: `${dayDate}-${now.getTime()}`,
    savedAt: now.toISOString(),
    dayDate,
    dateLabelRu,
    stopCount: stops.length,
    stops,
  };

  const prev = getSavedDayRoutes();
  const next = [entry, ...prev].slice(0, 40);
  writeAll(next);
  return entry;
}

export function removeSavedDayRoute(id: string) {
  const next = getSavedDayRoutes().filter((e) => e.id !== id);
  writeAll(next);
}
