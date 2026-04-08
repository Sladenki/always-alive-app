/**
 * Обратное геокодирование по OpenStreetMap: Photon, при ошибке — Nominatim.
 * В dev Vite проксирует `/api/photon` и `/api/nominatim` (см. vite.config.ts).
 */

interface PhotonProps {
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  city?: string;
  state?: string;
  locality?: string;
  type?: string;
  osm_key?: string;
  osm_value?: string;
}

interface PhotonResponse {
  features?: Array<{
    properties?: PhotonProps;
  }>;
}

const FETCH_TIMEOUT_MS = 10_000;

function photonBaseUrl(): string {
  return import.meta.env.DEV ? "/api/photon" : "https://photon.komoot.io";
}

function nominatimBaseUrl(): string {
  return import.meta.env.DEV ? "/api/nominatim" : "https://nominatim.openstreetmap.org";
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const ac = new AbortController();
  const t = window.setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } finally {
    window.clearTimeout(t);
  }
}

function formatPhotonLabel(p: PhotonProps): string {
  const name = p.name?.trim();
  const street = p.street?.trim();
  const hn = p.housenumber?.trim();
  const city = p.city?.trim() || p.locality?.trim() || p.district?.trim();

  if (name && name.length > 0) {
    if (city && !name.toLowerCase().includes(city.toLowerCase())) {
      return `${name} — ${city}`;
    }
    return name;
  }

  const line = [street, hn].filter(Boolean).join(", ");
  if (line) {
    return city ? `${line}, ${city}` : line;
  }

  const kind = p.osm_value?.trim();
  if (kind && kind !== "yes" && p.osm_key) {
    const ru = osmValueHintRu(p.osm_key, kind);
    return city ? `${ru}, ${city}` : ru;
  }

  if (city) return city;
  return "";
}

const OSM_HINTS: Record<string, Record<string, string>> = {
  shop: {
    supermarket: "Супермаркет",
    convenience: "Магазин у дома",
    mall: "Торговый центр",
    clothes: "Магазин одежды",
    bakery: "Пекарня",
    hairdresser: "Салон",
  },
  amenity: {
    cafe: "Кафе",
    restaurant: "Ресторан",
    bar: "Бар",
    fast_food: "Фастфуд",
    pharmacy: "Аптека",
    fuel: "АЗС",
    parking: "Парковка",
    library: "Библиотека",
    place_of_worship: "Храм / культовое здание",
  },
  tourism: {
    museum: "Музей",
    gallery: "Галерея",
    attraction: "Достопримечательность",
  },
  leisure: {
    park: "Парк",
    playground: "Площадка",
  },
};

function osmValueHintRu(osmKey: string, osmValue: string): string {
  const bucket = OSM_HINTS[osmKey];
  if (bucket?.[osmValue]) return bucket[osmValue];
  return osmValue.replace(/_/g, " ");
}

async function tryPhoton(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL(`${photonBaseUrl()}/reverse`);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("lang", "ru");

    const res = await fetchWithTimeout(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as PhotonResponse;
    const p = data.features?.[0]?.properties;
    if (!p) return null;

    const label = formatPhotonLabel(p);
    return label.length > 0 ? label : null;
  } catch {
    return null;
  }
}

function shortenNominatimLine(displayName: string): string {
  const parts = displayName.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 5).join(", ");
}

async function tryNominatim(lat: number, lng: number): Promise<string | null> {
  try {
    const u = new URL(`${nominatimBaseUrl()}/reverse`);
    u.searchParams.set("format", "json");
    u.searchParams.set("lat", String(lat));
    u.searchParams.set("lon", String(lng));
    u.searchParams.set("accept-language", "ru");

    const res = await fetchWithTimeout(u.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "ru",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { display_name?: string };
    const raw = data.display_name?.trim();
    if (!raw) return null;
    return shortenNominatimLine(raw);
  } catch {
    return null;
  }
}

/** Подпись для точки на карте или null, если оба сервиса недоступны */
export async function reverseGeocodeOsmLabel(lat: number, lng: number): Promise<string | null> {
  const a = await tryPhoton(lat, lng);
  if (a) return a;
  return tryNominatim(lat, lng);
}
