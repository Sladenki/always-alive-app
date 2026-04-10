import { addDays } from 'date-fns';
import type { EventData } from '@/data/types';

const WEEKDAY_TO_DOW: Record<string, number> = {
  'Воскресенье': 0,
  'Понедельник': 1,
  'Вторник': 2,
  'Среда': 3,
  'Четверг': 4,
  'Пятница': 5,
  'Суббота': 6,
};

function atNextWeekday(base: Date, dow: number, hh: number, mm: number): Date {
  const d = new Date(base);
  const day = d.getDay();
  let add = (dow - day + 7) % 7;
  const out = addDays(d, add);
  out.setHours(hh || 0, mm || 0, 0, 0);
  if (out <= base) {
    out.setDate(out.getDate() + 7);
  }
  return out;
}

/** Оценка даты начала события для обратного отсчёта (мок: Сегодня, дни недели и т.д.). */
export function estimateEventStart(event: EventData): Date {
  const [hh, mm] = event.time.split(':').map((x) => parseInt(x, 10));
  const base = new Date();
  base.setSeconds(0, 0);

  if (event.date === 'Сегодня') {
    const d = new Date(base);
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d;
  }

  if (event.date === 'Завтра') {
    const d = addDays(base, 1);
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d;
  }

  if (event.date === 'Суббота') {
    const d = new Date(base);
    const day = d.getDay();
    const add = (6 - day + 7) % 7;
    const sat = addDays(d, add);
    sat.setHours(hh || 0, mm || 0, 0, 0);
    if (sat <= base) {
      sat.setDate(sat.getDate() + 7);
    }
    return sat;
  }

  const dow = WEEKDAY_TO_DOW[event.date];
  if (dow !== undefined) {
    return atNextWeekday(base, dow, hh || 0, mm || 0);
  }

  const fallback = addDays(base, 7);
  fallback.setHours(hh || 0, mm || 0, 0, 0);
  return fallback;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Уже началось';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) {
    return `До начала: ${days}д ${hours}ч ${minutes}м`;
  }
  return `До начала: ${hours}ч ${minutes}м`;
}
