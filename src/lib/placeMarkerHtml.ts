import type { CityPlaceData } from '@/data/types';

function svgIcon(paths: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const GLYPHS: Record<string, string> = {
  cafe: svgIcon(
    '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/>',
  ),
  park: svgIcon(
    '<path d="M12 22v-7"/><path d="M9 8a3 3 0 0 1 6 0c0 3-3 5-3 5s-3-2-3-5z"/><path d="M5 12s2-1 4-1 4 1 4 1"/><path d="M3 18h4"/><path d="M17 18h4"/>',
  ),
  school: svgIcon(
    '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 1.33 9 1.33 12 0v-5"/>',
  ),
  fish: svgIcon(
    '<path d="M6.5 12c.94 2.34 3.09 4 5.5 4 3.31 0 6-2.69 6-6s-2.69-6-6-6c-2.41 0-4.56 1.66-5.5 4"/><path d="M6 12H2"/><path d="M10 8l-2 4 2 4"/>',
  ),
  pin: svgIcon('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
};

function glyphKey(place: CityPlaceData): keyof typeof GLYPHS {
  const c = place.category.toLowerCase();
  if (c.includes('кофейн') || c.includes('антикафе')) return 'cafe';
  if (c.includes('парк') || c.includes('площадь')) return 'park';
  if (c.includes('вуз')) return 'school';
  if (c.includes('рыбн') || c.includes('район')) return 'fish';
  return 'pin';
}

export function buildPlaceMarkerHtml(place: CityPlaceData, visitCount: number): string {
  const userBeen = visitCount > 0;
  const friendsOnly = !userBeen && place.friendsHaveBeen;
  const hereNow = !!place.hereNow;

  const borderColor = userBeen ? 'rgba(255,255,255,0.5)' : friendsOnly ? '#3b82f6' : '#64748b';
  const innerBg = userBeen ? '#6d28d9' : friendsOnly ? '#1e3a5f' : '#1e293b';
  const iconColor = userBeen ? '#ffffff' : friendsOnly ? '#93c5fd' : '#cbd5e1';

  const glyph = GLYPHS[glyphKey(place)].replace(/currentColor/g, iconColor);
  const pulseClass = hereNow ? 'map-place-now' : '';

  return `
<div class="place-marker-root ${pulseClass}" style="position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.45))">
  <div style="width:40px;height:40px;border-radius:50%;background:${innerBg};border:2.5px solid ${borderColor};display:flex;align-items:center;justify-content:center;box-sizing:border-box;color:${iconColor}">${glyph}</div>
</div>`;
}
