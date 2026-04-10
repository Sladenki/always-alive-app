import {
  CityPlaceData,
  EventData,
  GraphEventNodeData,
  GraphPlaceNodeData,
  MatchPersonData,
  NotificationData,
  PersonData,
  ProfileGraphNode,
} from './types';

const AVA = 'https://i.pravatar.cc/150?img=';

export const pAlina: PersonData = { id: 'p-alina', name: 'Алина К.', role: 'Дизайн · КГТУ', avatarUrl: `${AVA}1` };
export const pMaxim: PersonData = { id: 'p-maxim', name: 'Максим Р.', role: 'Разработчик · БФУ', avatarUrl: `${AVA}3` };
export const pKatya: PersonData = { id: 'p-katya', name: 'Катя В.', role: 'Студентка · КГТУ', avatarUrl: `${AVA}5` };
export const pDima: PersonData = { id: 'p-dima', name: 'Дима С.', role: 'Бэкенд · КГТУ', avatarUrl: `${AVA}7` };
export const pSonya: PersonData = { id: 'p-sonya', name: 'Соня М.', role: 'Продакт · БФУ', avatarUrl: `${AVA}9` };

const realPeople: PersonData[] = [pAlina, pMaxim, pKatya, pDima, pSonya];

export const placeholderPeople: PersonData[] = [
  { id: 'ph1', name: 'Студент КГТУ', role: 'Ещё не указал, кто он', isPlaceholder: true },
  { id: 'ph2', name: 'Житель Калининграда', role: 'Ещё не указал, кто он', isPlaceholder: true },
  { id: 'ph3', name: 'Студент БФУ', role: 'Ещё не указал, кто он', isPlaceholder: true },
];

/** Суммарный «живой» счётчик для героя на ленте */
export const CITY_GOING_COUNT = 284;

export const mockEvents: EventData[] = [
  {
    id: 'e1',
    title: 'Хакатон по искусственному интеллекту',
    description:
      'Командный хакатон: задачи от партнёров, менторы и демо в конце дня. Регистрация на месте до 10:30.',
    location: 'КГТУ',
    address: 'ул. Советская, 1',
    lat: 54.7138,
    lng: 20.3967,
    date: 'Суббота',
    time: '10:00',
    category: '🤖 ИИ',
    imageUrl: '',
    realSignups: 31,
    views: 0,
    temperature: 'hot',
    attendees: [pAlina, pKatya, pDima, pSonya, pMaxim],
  },
  {
    id: 'e2',
    title: 'Джазовый вечер в Доме Искусств',
    description: 'Акустический джаз, уютный зал и бар. Можно прийти одному или с друзьями.',
    location: 'Дом искусств',
    address: 'Московский пр., 18',
    lat: 54.7121,
    lng: 20.5045,
    date: 'Сегодня',
    time: '19:00',
    category: '🎷 Джаз',
    imageUrl: '',
    realSignups: 14,
    views: 0,
    temperature: 'warm',
    attendees: [pAlina, pMaxim, pKatya],
  },
  {
    id: 'e3',
    title: 'Питч-сессия стартапов КГТУ',
    description: 'Короткие питчи проектов, обратная связь от приглашённых экспертов и нетворкинг.',
    location: 'КГТУ',
    address: 'ул. Советская, 1',
    lat: 54.7142,
    lng: 20.3985,
    date: 'Пятница',
    time: '18:00',
    category: '🚀 Стартапы',
    imageUrl: '',
    realSignups: 8,
    views: 0,
    temperature: 'warm',
    attendees: [pKatya, pDima, pSonya],
  },
  {
    id: 'e4',
    title: 'Воркшоп по UI/UX дизайну',
    description: 'Практика в Figma: сетки, компоненты и прототип. Принесите ноутбук.',
    location: 'Коворкинг «Точка»',
    address: 'ул. Черняховского, 56',
    lat: 54.7145,
    lng: 20.474,
    date: 'Воскресенье',
    time: '14:00',
    category: '💻 Дизайн',
    imageUrl: '',
    realSignups: 22,
    views: 0,
    temperature: 'warm',
    attendees: [pAlina, pMaxim, pSonya],
  },
  {
    id: 'e5',
    title: 'Открытая лекция по нейросетям',
    description: 'Без формулы «для всех»: как устроены большие модели и чем они полезны в учёбе.',
    location: 'КГТУ',
    address: 'ул. Советская, 1',
    lat: 54.7135,
    lng: 20.3975,
    date: 'Сегодня',
    time: '17:00',
    category: '🧠 Лекция',
    imageUrl: '',
    realSignups: 45,
    views: 0,
    temperature: 'hot',
    attendees: realPeople,
  },
];

export const onboardingNotifications: NotificationData[] = [];

/** Демо match partner для «Совпадение» на событии */
export const demoMatchPerson: MatchPersonData = {
  id: 'gx-alina',
  name: 'Алина',
  subtitle: 'Дизайн · КГТУ',
  bio: 'Дизайнер, люблю джаз и кофе',
  initials: 'А',
};

/** Совпадение в месте (демо) */
export const demoPlaceMatchPerson: MatchPersonData = {
  id: 'gx-maxim',
  name: 'Максим',
  subtitle: 'Разработчик · БФУ',
  bio: 'Сейчас в Типографии, люблю кофе и стендап',
  initials: 'М',
};

const gpAlina: PersonData = { id: 'gx-alina', name: 'Алина К.', role: 'Дизайн · КГТУ', avatarUrl: `${AVA}1` };
const gpMaxim: PersonData = { id: 'gx-maxim', name: 'Максим Р.', role: 'Разработчик · БФУ', avatarUrl: `${AVA}3` };
const gpKatya: PersonData = { id: 'gx-katya', name: 'Катя В.', role: 'Студентка · КГТУ', avatarUrl: `${AVA}5` };
const gpDima: PersonData = { id: 'gx-dima', name: 'Дима С.', role: 'Бэкенд · КГТУ', avatarUrl: `${AVA}7` };
const gpSonya: PersonData = { id: 'gx-sonya', name: 'Соня М.', role: 'Продакт · БФУ', avatarUrl: `${AVA}9` };

/** Узлы событий на графе профиля */
export const graphProfileEventsMock: GraphEventNodeData[] = [
  {
    id: 'g-jazz',
    shortLabel: 'Джаз',
    fullTitle: 'Джазовый вечер в Доме Искусств',
    dateLabel: 'Сегодня · 19:00',
    connectionCount: 2,
    isUpcoming: false,
    feedEventIds: ['e2'],
    people: [gpAlina, gpMaxim],
  },
  {
    id: 'g-hack',
    shortLabel: 'Хакатон',
    fullTitle: 'Хакатон по искусственному интеллекту',
    dateLabel: 'Суббота · 10:00',
    connectionCount: 2,
    isUpcoming: false,
    feedEventIds: ['e1'],
    people: [gpKatya, gpDima],
  },
  {
    id: 'g-tedx',
    shortLabel: 'TEDx',
    fullTitle: 'Питч-сессия стартапов КГТУ',
    dateLabel: 'Пятница · 18:00',
    connectionCount: 1,
    isUpcoming: false,
    feedEventIds: ['e3'],
    people: [gpSonya],
  },
  {
    id: 'g-workshop',
    shortLabel: 'Воркшоп',
    fullTitle: 'Воркшоп по UI/UX дизайну',
    dateLabel: 'Воскресенье · 14:00',
    connectionCount: 0,
    isUpcoming: true,
    feedEventIds: ['e4'],
    people: [],
  },
  {
    id: 'g-lecture',
    shortLabel: 'Лекция',
    fullTitle: 'Открытая лекция по нейросетям',
    dateLabel: 'Сегодня · 17:00',
    connectionCount: 0,
    isUpcoming: true,
    feedEventIds: ['e5'],
    people: [],
  },
];

export const initialPlaceVisitCounts: Record<string, number> = {
  'p-tipografia': 3,
  'p-kgtu': 12,
  'p-bufet': 1,
};

export const mockPlaces: CityPlaceData[] = [
  {
    id: 'p-tipografia',
    name: 'Антикафе «Типография»',
    category: 'Антикафе',
    icon: '☕',
    lat: 54.7104,
    lng: 20.4522,
    totalBeenHere: 128,
    recentPeople: [gpAlina, gpMaxim, gpKatya],
    hereNow: gpMaxim,
    friendsHaveBeen: true,
  },
  {
    id: 'p-bufet',
    name: 'Кофейня «Буфет»',
    category: 'Кофейня',
    icon: '☕',
    lat: 54.7065,
    lng: 20.511,
    totalBeenHere: 86,
    recentPeople: [gpAlina, gpDima, gpSonya],
    friendsHaveBeen: true,
  },
  {
    id: 'p-park-pobedy',
    name: 'Парк Победы',
    category: 'Парк',
    icon: '🌳',
    lat: 54.7227,
    lng: 20.485,
    totalBeenHere: 340,
    recentPeople: [gpKatya, gpDima, gpSonya],
    friendsHaveBeen: false,
  },
  {
    id: 'p-kgtu',
    name: 'КГТУ',
    category: 'Вуз',
    icon: '🎓',
    lat: 54.7138,
    lng: 20.3967,
    totalBeenHere: 2100,
    recentPeople: [gpKatya, gpDima, gpSonya],
    friendsHaveBeen: true,
  },
  {
    id: 'p-bfu',
    name: 'БФУ им. Канта',
    category: 'Вуз',
    icon: '🎓',
    lat: 54.7196,
    lng: 20.513,
    totalBeenHere: 1800,
    recentPeople: [gpAlina, gpMaxim, gpSonya],
    friendsHaveBeen: true,
  },
];

/** Узлы мест на графе профиля */
export const graphProfilePlacesMock: GraphPlaceNodeData[] = [
  {
    nodeType: 'place',
    id: 'gp-tipografia',
    shortLabel: 'Типография',
    fullTitle: 'Антикафе «Типография»',
    placeId: 'p-tipografia',
    visitCount: 3,
    people: [gpAlina, gpMaxim],
  },
  {
    nodeType: 'place',
    id: 'gp-kgtu',
    shortLabel: 'КГТУ',
    fullTitle: 'Калининградский государственный технический университет',
    placeId: 'p-kgtu',
    visitCount: 12,
    people: [gpKatya, gpDima, gpSonya],
  },
  {
    nodeType: 'place',
    id: 'gp-bufet',
    shortLabel: 'Буфет',
    fullTitle: 'Кофейня «Буфет»',
    placeId: 'p-bufet',
    visitCount: 1,
    people: [gpAlina],
  },
];

export const placeNotificationsMock: NotificationData[] = [
  {
    id: 'pn-map',
    icon: '🟢',
    text: 'Алина сейчас в «Типографии» — ты рядом?',
    time: 'только что',
    isRead: false,
    kind: 'place_map',
    placeId: 'p-tipografia',
  },
  {
    id: 'pn-sheet',
    icon: '📍',
    text: 'Ты был в Типографии 3 раза — это твоё место',
    time: '5 мин',
    isRead: false,
    kind: 'place_sheet',
    placeId: 'p-tipografia',
  },
  {
    id: 'pn-match',
    icon: '🤝',
    text: 'Максим тоже бывает в «Буфете» — общее место на карте',
    time: '1 ч',
    isRead: false,
    kind: 'place_match',
    placeId: 'p-bufet',
  },
  {
    id: 'pn-kgtu',
    icon: '🎓',
    text: 'Сегодня у КГТУ лекция и вечером джаз рядом — открыть карту?',
    time: '2 ч',
    isRead: false,
    kind: 'place_map',
    placeId: 'p-kgtu',
  },
];

/** Карточки «Прямо сейчас в городе» на ленте */
export const feedLivePlacesMock = [
  {
    placeId: 'p-tipografia' as const,
    name: 'Антикафе «Типография»',
    hereCount: 7,
    friendLine: 'Максим здесь сейчас 🟢' as string | null,
  },
  {
    placeId: 'p-bufet' as const,
    name: 'Кофейня «Буфет»',
    hereCount: 4,
    friendLine: null as string | null,
  },
  {
    placeId: 'p-park-pobedy' as const,
    name: 'Парк Победы',
    hereCount: 12,
    friendLine: null as string | null,
  },
];

export function getPlaceById(placeId: string): CityPlaceData | undefined {
  return mockPlaces.find((p) => p.id === placeId);
}

export function isPlaceGraphNode(n: ProfileGraphNode): n is GraphPlaceNodeData {
  return (n as GraphPlaceNodeData).nodeType === 'place';
}

function shortLabelFromPlaceName(name: string, maxLen = 11): string {
  const n = name.replace(/«|»/g, '').trim();
  if (n.length <= maxLen) return n;
  return `${n.slice(0, maxLen - 1)}…`;
}

function mergePeopleLists(baseList: PersonData[], added: PersonData[]): PersonData[] {
  const merged = [...baseList];
  const ids = new Set(merged.map((p) => p.id));
  for (const p of added) {
    if (!ids.has(p.id)) {
      merged.push(p);
      ids.add(p.id);
    }
  }
  return merged;
}

/**
 * Базовые узлы графа + чек-ины: если ты нажал «Я здесь» в месте, которого не было в моке узлов,
 * добавляем шестиугольник из карточки города.
 */
export function mergePlaceGraphWithAcquaintances(
  base: GraphPlaceNodeData[],
  acc: Record<string, PersonData[]>,
  visitOverrides: Record<string, number>,
): GraphPlaceNodeData[] {
  const merged = base.map((node) => {
    const added = acc[node.placeId] ?? [];
    const mergedPeople = mergePeopleLists(node.people, added);
    const visitCount = Math.max(node.visitCount, visitOverrides[node.placeId] ?? 0);
    return { ...node, people: mergedPeople, visitCount };
  });

  const inGraph = new Set(merged.map((n) => n.placeId));
  const candidateIds = new Set<string>();
  for (const [pid, count] of Object.entries(visitOverrides)) {
    if (count > 0) candidateIds.add(pid);
  }
  for (const pid of Object.keys(acc)) {
    if ((acc[pid]?.length ?? 0) > 0) candidateIds.add(pid);
  }

  const appended: GraphPlaceNodeData[] = [];
  for (const pid of candidateIds) {
    if (inGraph.has(pid)) continue;
    const place = getPlaceById(pid);
    if (!place) continue;
    const vcRaw = visitOverrides[pid] ?? 0;
    const added = acc[pid] ?? [];
    if (vcRaw <= 0 && added.length === 0) continue;
    const visitCount = vcRaw > 0 ? vcRaw : 1;
    const people = mergePeopleLists(place.recentPeople, added);
    appended.push({
      nodeType: 'place',
      id: `gp-${place.id}`,
      shortLabel: shortLabelFromPlaceName(place.name),
      fullTitle: place.name,
      placeId: place.id,
      visitCount,
      people,
    });
  }

  return [...merged, ...appended];
}

export function getCombinedGraphStats(
  eventNodes: GraphEventNodeData[],
  placeNodes: GraphPlaceNodeData[],
) {
  const attendedEvents = eventNodes.filter((n) => !n.isUpcoming).length;
  const upcoming = eventNodes.filter((n) => n.isUpcoming).length;
  const placeCount = placeNodes.length;
  const eventsAndPlaces = attendedEvents + placeCount;
  const ids = new Set<string>();
  eventNodes.forEach((n) =>
    n.people.forEach((p) => {
      if (!p.isPlaceholder) ids.add(p.id);
    }),
  );
  placeNodes.forEach((n) =>
    n.people.forEach((p) => {
      if (!p.isPlaceholder) ids.add(p.id);
    }),
  );
  return {
    eventsAndPlaces,
    connectionsUnique: ids.size,
    upcoming,
    attendedEvents,
    placeCount,
  };
}

export function buildCombinedProfileNodes(
  events: GraphEventNodeData[],
  places: GraphPlaceNodeData[],
): ProfileGraphNode[] {
  return [...events, ...places];
}

export function getMatchTagLine(event: EventData): string {
  return `${event.title} · ${event.date} ${event.time}`;
}

/** Короткая подпись центрального узла в треугольнике совпадения */
export function getEventCenterNodeLabel(event: EventData): string {
  const t = event.title;
  if (t.length <= 14) return t;
  return `${t.slice(0, 12)}…`;
}

export function getMatchPersonForEvent(_eventId: string): MatchPersonData {
  return demoMatchPerson;
}

export function matchPlacePersonToPersonData(): PersonData {
  return {
    id: demoPlaceMatchPerson.id,
    name: 'Максим Р.',
    role: demoPlaceMatchPerson.subtitle,
    avatarUrl: pMaxim.avatarUrl,
  };
}

export function getGraphProfileStats(nodes: GraphEventNodeData[]) {
  const attended = nodes.filter((n) => !n.isUpcoming).length;
  const upcoming = nodes.filter((n) => n.isUpcoming).length;
  const connections = nodes.reduce((s, n) => s + n.connectionCount, 0);
  return { attended, upcoming, connections, eventsTotal: nodes.length };
}

export function mergeGraphNodesWithAcquaintances(
  base: GraphEventNodeData[],
  acc: Record<string, PersonData[]>,
): GraphEventNodeData[] {
  return base.map((node) => {
    const added = node.feedEventIds.flatMap((fid) => acc[fid] ?? []);
    const mergedPeople = [...node.people];
    const ids = new Set(mergedPeople.map((p) => p.id));
    for (const p of added) {
      if (!ids.has(p.id)) {
        mergedPeople.push(p);
        ids.add(p.id);
      }
    }
    const connectionCount = Math.max(node.connectionCount, mergedPeople.length);
    return { ...node, people: mergedPeople, connectionCount };
  });
}

export function getInterestCount(event: EventData): number {
  return Math.max(event.views + event.realSignups, 7);
}

export function getAttendeesWithPlaceholders(event: EventData): PersonData[] {
  const real = event.attendees || [];
  if (real.length >= 3) return real;
  const needed = 3 - real.length;
  return [...real, ...placeholderPeople.slice(0, needed)];
}

export function getTodayEvents(): EventData[] {
  return mockEvents
    .filter((e) => e.date === 'Сегодня')
    .sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
}

export function getTomorrowEvents(): EventData[] {
  return mockEvents.filter((e) => e.date === 'Завтра');
}
