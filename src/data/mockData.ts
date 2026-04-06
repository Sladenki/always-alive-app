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

const realPeople: PersonData[] = [
  { id: 'p1', name: 'Алина К.', role: 'Студентка БФУ', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'p2', name: 'Максим Д.', role: 'Разработчик', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: 'p3', name: 'Катя М.', role: 'Студентка КГТУ', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
  { id: 'p4', name: 'Артём В.', role: 'Дизайнер', avatarUrl: 'https://i.pravatar.cc/150?img=7' },
  { id: 'p5', name: 'Даша Л.', role: 'Фотограф', avatarUrl: 'https://i.pravatar.cc/150?img=9' },
  { id: 'p6', name: 'Иван С.', role: 'Студент БФУ', avatarUrl: 'https://i.pravatar.cc/150?img=11' },
  { id: 'p7', name: 'Мария Б.', role: 'Маркетолог', avatarUrl: 'https://i.pravatar.cc/150?img=16' },
  { id: 'p8', name: 'Денис П.', role: 'Музыкант', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
];

export const placeholderPeople: PersonData[] = [
  { id: 'ph1', name: 'Студент КГТУ', role: 'Ещё не указал кто он', isPlaceholder: true },
  { id: 'ph2', name: 'Житель Калининграда', role: 'Ещё не указал кто он', isPlaceholder: true },
  { id: 'ph3', name: 'Студент БФУ', role: 'Ещё не указал кто он', isPlaceholder: true },
];

/** Людей в городе «сейчас куда-то идут» — для живого блока на ленте */
export const CITY_GOING_COUNT = 47;

export const mockEvents: EventData[] = [
  {
    id: 'e1',
    title: 'Вечер настольных игр',
    description: 'Собираемся играть в настолки: Catan, Codenames, Uno и другие. Приходите с друзьями или находите новых!',
    location: 'Антикафе «Типография»',
    address: 'ул. Баранова, 32',
    lat: 54.7104,
    lng: 20.4522,
    date: 'Сегодня',
    time: '19:00',
    category: '🎲 Игры',
    imageUrl: '',
    realSignups: 0,
    views: 12,
    temperature: 'cold',
    attendees: [],
  },
  {
    id: 'e2',
    title: 'Утренняя пробежка на набережной',
    description: 'Бежим 5 км вдоль Верхнего озера. Подходит для любого уровня. После — кофе!',
    location: 'Верхнее озеро',
    address: 'наб. Верхнего озера',
    lat: 54.7180,
    lng: 20.4870,
    date: 'Сегодня',
    time: '07:30',
    category: '🏃 Спорт',
    imageUrl: '',
    realSignups: 8,
    views: 34,
    temperature: 'warm',
    attendees: realPeople.slice(0, 8),
  },
  {
    id: 'e3',
    title: 'Open mic: стендап и поэзия',
    description: 'Открытый микрофон для всех. Можно читать стихи, шутить или просто слушать. Уютная атмосфера.',
    location: 'Бар «Лондон»',
    address: 'Ленинский пр., 18',
    lat: 54.7066,
    lng: 20.5100,
    date: 'Сегодня',
    time: '20:00',
    category: '🎤 Творчество',
    imageUrl: '',
    realSignups: 24,
    views: 89,
    temperature: 'hot',
    attendees: realPeople,
  },
  {
    id: 'e4',
    title: 'Воркшоп: основы UX-дизайна',
    description: 'Практический воркшоп от дизайнеров из Яндекса. Разберём реальные кейсы и прототипирование в Figma.',
    location: 'Коворкинг «Точка»',
    address: 'ул. Черняховского, 56',
    lat: 54.7145,
    lng: 20.4740,
    date: 'Завтра',
    time: '14:00',
    category: '💻 Образование',
    imageUrl: '',
    realSignups: 15,
    views: 52,
    temperature: 'warm',
    attendees: realPeople.slice(0, 5),
  },
  {
    id: 'e5',
    title: 'Кинопоказ на крыше',
    description: 'Смотрим «Всё везде и сразу» на крыше с проектором. Пледы и горячий шоколад включены.',
    location: 'Крыша ТЦ «Европа»',
    address: 'ул. Театральная, 30',
    lat: 54.7123,
    lng: 20.5020,
    date: 'Завтра',
    time: '21:00',
    category: '🎬 Кино',
    imageUrl: '',
    realSignups: 2,
    views: 28,
    temperature: 'cold',
    attendees: realPeople.slice(0, 2),
  },
  {
    id: 'e6',
    title: 'Субботний маркет у Кафедрального',
    description: 'Фермерские продукты, хендмейд, живая музыка. Лучшее место для прогулки на выходных.',
    location: 'Остров Канта',
    address: 'ул. Канта, 1',
    lat: 54.7066,
    lng: 20.5114,
    date: 'Суббота',
    time: '10:00',
    category: '🛍 Маркет',
    imageUrl: '',
    realSignups: 45,
    views: 210,
    temperature: 'hot',
    attendees: realPeople,
  },
  {
    id: 'e7',
    title: 'Разговорный клуб: English',
    description: 'Практикуем английский в неформальной обстановке. Все уровни приветствуются. Тема: Travel.',
    location: 'Кофейня «Brew Bar»',
    address: 'пр. Мира, 45',
    lat: 54.7200,
    lng: 20.4600,
    date: 'Завтра',
    time: '18:30',
    category: '🗣 Языки',
    imageUrl: '',
    realSignups: 1,
    views: 19,
    temperature: 'cold',
    attendees: realPeople.slice(0, 1),
  },
];

export const onboardingNotifications: NotificationData[] = [
  { id: 'n1', icon: '👋', text: 'Добро пожаловать в Nexus — твой город живёт здесь', time: 'сейчас', isRead: false, kind: 'onboarding' },
  { id: 'n2', icon: '🔥', text: 'Сегодня 3 популярных события рядом с тобой', time: '1 мин', isRead: false, kind: 'onboarding' },
  { id: 'n3', icon: '📍', text: 'Открой карту и посмотри что происходит', time: '2 мин', isRead: false, kind: 'onboarding' },
];

/** Demo match partner for any «Совпадение» flow */
export const demoMatchPerson: MatchPersonData = {
  id: 'gx-alina',
  name: 'Алина',
  subtitle: 'КГТУ · 2 курс',
  bio: 'Дизайнер, люблю джаз и кофе',
  initials: 'А',
};

/** Совпадение в месте (демо) */
export const demoPlaceMatchPerson: MatchPersonData = {
  id: 'gx-maxim',
  name: 'Максим',
  subtitle: 'Разработчик',
  bio: 'Люблю стендап и кофе',
  initials: 'М',
};

const gpAlina: PersonData = { id: 'gx-alina', name: 'Алина', role: 'Дизайн', avatarUrl: 'https://i.pravatar.cc/150?img=1' };
const gpMaxim: PersonData = { id: 'gx-maxim', name: 'Максим', role: 'Dev', avatarUrl: 'https://i.pravatar.cc/150?img=3' };
const gpKatya: PersonData = { id: 'gx-katya', name: 'Катя', role: 'Студентка', avatarUrl: 'https://i.pravatar.cc/150?img=5' };
const gpDima: PersonData = { id: 'gx-dima', name: 'Дима', role: 'Бэкенд', avatarUrl: 'https://i.pravatar.cc/150?img=7' };
const gpSonya: PersonData = { id: 'gx-sonya', name: 'Соня', role: 'Маркетинг', avatarUrl: 'https://i.pravatar.cc/150?img=9' };

/** Profile graph: attended + upcoming (mock). Sizes / colors derived in UI from connectionCount + isUpcoming */
export const graphProfileEventsMock: GraphEventNodeData[] = [
  {
    id: 'g-jazz',
    shortLabel: 'Джаз',
    fullTitle: 'Джазовый вечер',
    dateLabel: '12 марта · 19:00',
    connectionCount: 2,
    isUpcoming: false,
    feedEventIds: ['e3'],
    people: [gpAlina, gpMaxim],
  },
  {
    id: 'g-hack',
    shortLabel: 'Хакатон',
    fullTitle: 'Хакатон Kaliningrad.tech',
    dateLabel: '2 апреля · 10:00',
    connectionCount: 2,
    isUpcoming: false,
    feedEventIds: ['e2'],
    people: [gpKatya, gpDima],
  },
  {
    id: 'g-tedx',
    shortLabel: 'TEDx',
    fullTitle: 'TEDx Kaliningrad',
    dateLabel: '20 марта · 18:00',
    connectionCount: 1,
    isUpcoming: false,
    feedEventIds: ['e6'],
    people: [gpSonya],
  },
  {
    id: 'g-workshop',
    shortLabel: 'Воркшоп',
    fullTitle: 'Воркшоп по дизайну',
    dateLabel: 'Завтра · 14:00',
    connectionCount: 0,
    isUpcoming: true,
    feedEventIds: ['e4'],
    people: [],
  },
  {
    id: 'g-lecture',
    shortLabel: 'Лекция',
    fullTitle: 'Лекция о нейросетях',
    dateLabel: 'Суббота · 16:00',
    connectionCount: 0,
    isUpcoming: true,
    feedEventIds: ['e7'],
    people: [],
  },
];

/** Стартовые визиты пользователя по местам (демо) */
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
  {
    id: 'p-ploshad',
    name: 'Площадь Победы',
    category: 'Площадь',
    icon: '📍',
    lat: 54.7139,
    lng: 20.5115,
    totalBeenHere: 920,
    recentPeople: [gpMaxim, gpKatya, gpDima],
    friendsHaveBeen: false,
  },
  {
    id: 'p-rybnaya',
    name: 'Рыбная деревня',
    category: 'Район',
    icon: '🐟',
    lat: 54.7011,
    lng: 20.5083,
    totalBeenHere: 412,
    recentPeople: [gpAlina, gpKatya, gpSonya],
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
    text: 'Алина сейчас в Типографии — ты рядом?',
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
    text: 'Максим тоже бывает в Буфете — у вас общее место',
    time: '1 ч',
    isRead: false,
    kind: 'place_match',
    placeId: 'p-bufet',
  },
];

/** Карточки «Прямо сейчас в городе» на ленте */
export const feedLivePlacesMock = [
  {
    placeId: 'p-tipografia' as const,
    name: 'Антикафе «Типография»',
    hereCount: 7,
    friendLine: 'Алина здесь 🟢' as string | null,
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

export function mergePlaceGraphWithAcquaintances(
  base: GraphPlaceNodeData[],
  acc: Record<string, PersonData[]>,
  visitOverrides: Record<string, number>,
): GraphPlaceNodeData[] {
  return base.map((node) => {
    const added = acc[node.placeId] ?? [];
    const mergedPeople = [...node.people];
    const ids = new Set(mergedPeople.map((p) => p.id));
    for (const p of added) {
      if (!ids.has(p.id)) {
        mergedPeople.push(p);
        ids.add(p.id);
      }
    }
    const visitCount = Math.max(node.visitCount, visitOverrides[node.placeId] ?? 0);
    return { ...node, people: mergedPeople, visitCount };
  });
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

/** Short label for the center node in the triangle graph */
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
    name: demoPlaceMatchPerson.name,
    role: demoPlaceMatchPerson.subtitle,
  };
}

export function getGraphProfileStats(nodes: GraphEventNodeData[]) {
  const attended = nodes.filter(n => !n.isUpcoming).length;
  const upcoming = nodes.filter(n => n.isUpcoming).length;
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
  return mockEvents.filter(e => e.date === 'Сегодня');
}

export function getTomorrowEvents(): EventData[] {
  return mockEvents.filter(e => e.date === 'Завтра');
}
