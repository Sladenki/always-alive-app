import type { DetectedStop } from '@/contexts/LocationContext';

export function sortStopsByTime(stops: DetectedStop[]): DetectedStop[] {
  return [...stops].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function formatStopTime(d: Date): string {
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** «2 часа 15 минут» */
export function formatDurationRu(totalMin: number): string {
  if (totalMin < 1) return 'меньше минуты';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${pluralRu(h, 'час', 'часа', 'часов')}`);
  if (m > 0) parts.push(`${m} ${pluralRu(m, 'минута', 'минуты', 'минут')}`);
  return parts.join(' ');
}

function placesWord(n: number): string {
  return `${n} ${pluralRu(n, 'место', 'места', 'мест')}`;
}

export interface DayStoryNarrative {
  dateLabel: string;
  title: string;
  subtitle: string;
  body: string;
  stats: string;
}

/** Короткая «история дня» для экрана итога */
export function buildDayStoryNarrative(sorted: DetectedStop[]): DayStoryNarrative | null {
  if (sorted.length === 0) return null;
  const ref = sorted[0].startTime;
  const dateLabel = ref.toLocaleDateString('ru', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const totalMin = sorted.reduce((a, s) => a + s.durationMin, 0);
  const n = sorted.length;

  const title = 'День в городе';
  const subtitle = placesWord(n);

  let body = '';
  if (n === 1) {
    const s = sorted[0];
    body = `Сегодня весь маршрут свёлся к одной остановке — «${s.label}». Примерно ${formatDurationRu(s.durationMin)} между делом, улицами и настроением.`;
  } else if (n === 2) {
    const [a, b] = sorted;
    body = `Ты начал с «${a.label}», а потом переместился к «${b.label}» — короткая, но понятная линия по карте.`;
  } else {
    const first = sorted[0];
    const last = sorted[n - 1];
    const middle = sorted.slice(1, -1);
    const middleText = middle.map((s) => `«${s.label}»`).join(' → ');
    body = `Старт у «${first.label}» (${formatStopTime(first.startTime)}), затем ${middleText}, и финиш у «${last.label}». Так сложился день — без лишней суеты, но с ясным маршрутом.`;
  }

  const stats = `Суммарно около ${formatDurationRu(totalMin)} в этих точках · на карте они идут по порядку 1 → 2 → …`;

  return { dateLabel, title, subtitle, body, stats };
}

/** Краткая текстовая история дня по порядку остановок */
export function buildDayRouteStory(sorted: DetectedStop[]): string {
  if (sorted.length === 0) return '';
  return sorted
    .map((s, i) => {
      const t = formatStopTime(s.startTime);
      const dur = s.durationMin;
      if (i === 0) return `День начался в ${s.label} (${t}, ~${dur} мин)`;
      return `затем ${s.label} (${t}, ~${dur} мин)`;
    })
    .join(' → ');
}
