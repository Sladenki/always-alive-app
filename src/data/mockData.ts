import { EventData, NotificationData, PersonData } from './types';

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
  { id: 'n1', icon: '👋', text: 'Добро пожаловать в Nexus — твой город живёт здесь', time: 'сейчас', isRead: false },
  { id: 'n2', icon: '🔥', text: 'Сегодня 3 популярных события рядом с тобой', time: '1 мин', isRead: false },
  { id: 'n3', icon: '📍', text: 'Открой карту и посмотри что происходит', time: '2 мин', isRead: false },
];

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
