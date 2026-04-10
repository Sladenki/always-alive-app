/** Mock data for "Мой день" route feature */

export interface DayRouteStop {
  id: string;
  label: string;
  icon: string;
  lat: number;
  lng: number;
  startTime: string; // "09:15"
  endTime: string;   // "10:00"
  durationMin: number;
  durationLabel: string;
}

export interface NearMissPerson {
  id: string;
  name: string;
  avatarUrl: string;
  timeLabel: string;      // "был здесь в 11:20"
  deltaLabel: string;     // "на 40 минут позже тебя"
}

export interface NearMissData {
  stopId: string;
  people: NearMissPerson[];
}

export const mockDayRoute: DayRouteStop[] = [
  {
    id: 'dr-1',
    label: 'КГТУ',
    icon: '🎓',
    lat: 54.7138,
    lng: 20.3967,
    startTime: '09:15',
    endTime: '10:00',
    durationMin: 45,
    durationLabel: '45 мин',
  },
  {
    id: 'dr-2',
    label: 'Кофейня «Буфет»',
    icon: '☕',
    lat: 54.7065,
    lng: 20.511,
    startTime: '10:30',
    endTime: '11:45',
    durationMin: 75,
    durationLabel: '1ч 15мин',
  },
  {
    id: 'dr-3',
    label: 'Парк Победы',
    icon: '🌳',
    lat: 54.7227,
    lng: 20.485,
    startTime: '13:00',
    endTime: '13:30',
    durationMin: 30,
    durationLabel: '30 мин',
  },
  {
    id: 'dr-4',
    label: 'Антикафе «Типография»',
    icon: '☕',
    lat: 54.7104,
    lng: 20.4522,
    startTime: '15:00',
    endTime: '17:30',
    durationMin: 150,
    durationLabel: '2ч 30мин',
  },
  {
    id: 'dr-5',
    label: 'Остров Канта',
    icon: '🏛',
    lat: 54.7067,
    lng: 20.5115,
    startTime: '19:00',
    endTime: '19:45',
    durationMin: 45,
    durationLabel: '45 мин',
  },
];

export const mockNearMisses: NearMissData[] = [
  {
    stopId: 'dr-2',
    people: [
      {
        id: 'nm-alina',
        name: 'Алина',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        timeLabel: 'была здесь в 11:20',
        deltaLabel: 'на 40 минут позже тебя',
      },
    ],
  },
  {
    stopId: 'dr-4',
    people: [
      {
        id: 'nm-maxim',
        name: 'Максим',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
        timeLabel: 'был здесь в 16:30',
        deltaLabel: 'через 1.5 часа после тебя',
      },
      {
        id: 'nm-dima',
        name: 'Дима',
        avatarUrl: 'https://i.pravatar.cc/150?img=7',
        timeLabel: 'был здесь в 15:20',
        deltaLabel: 'через 20 минут после тебя',
      },
    ],
  },
  {
    stopId: 'dr-5',
    people: [
      {
        id: 'nm-katya',
        name: 'Катя',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
        timeLabel: 'была здесь в 18:45',
        deltaLabel: 'за 15 минут до тебя',
      },
    ],
  },
];

/** Маршрут Максима для сравнения */
export const mockMaximRoute: DayRouteStop[] = [
  {
    id: 'mx-1',
    label: 'БФУ им. Канта',
    icon: '🎓',
    lat: 54.7196,
    lng: 20.513,
    startTime: '09:00',
    endTime: '12:00',
    durationMin: 180,
    durationLabel: '3ч',
  },
  {
    id: 'mx-2',
    label: 'Кофейня «Буфет»',
    icon: '☕',
    lat: 54.7065,
    lng: 20.511,
    startTime: '12:15',
    endTime: '13:00',
    durationMin: 45,
    durationLabel: '45 мин',
  },
  {
    id: 'mx-3',
    label: 'Антикафе «Типография»',
    icon: '☕',
    lat: 54.7104,
    lng: 20.4522,
    startTime: '16:00',
    endTime: '18:00',
    durationMin: 120,
    durationLabel: '2ч',
  },
];

export function getTotalNearMissCount(): number {
  return mockNearMisses.reduce((sum, nm) => sum + nm.people.length, 0);
}

export function getTotalDistance(): string {
  // Approximate distance for the mock route
  return '6.2';
}

export function getNearMissForStop(stopId: string): NearMissPerson[] {
  return mockNearMisses.find((nm) => nm.stopId === stopId)?.people ?? [];
}
