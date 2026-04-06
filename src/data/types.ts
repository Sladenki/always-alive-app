export type EventTemperature = 'cold' | 'warm' | 'hot';

export interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  category: string;
  imageUrl: string;
  realSignups: number;
  views: number;
  temperature: EventTemperature;
  attendees: PersonData[];
}

export interface PersonData {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isPlaceholder?: boolean;
}

export type NotificationKind =
  | 'onboarding'
  | 'fomo'
  /** Открыть карту на месте */
  | 'place_map'
  /** Открыть карту + карточку места */
  | 'place_sheet'
  /** Место: совпадение как на событии */
  | 'place_match';

export interface NotificationData {
  id: string;
  icon: string;
  text: string;
  time: string;
  isRead: boolean;
  kind?: NotificationKind;
  /** For FOMO: opens match moment for this feed event */
  eventId?: string;
  /** For place notifications */
  placeId?: string;
}

/** Точка города на карте (чек-ин) */
export interface CityPlaceData {
  id: string;
  name: string;
  category: string;
  icon: string;
  lat: number;
  lng: number;
  /** Сколько человек было здесь (в моке) */
  totalBeenHere: number;
  /** До 3 аватаров для листа */
  recentPeople: PersonData[];
  /** Кто сейчас здесь (демо) */
  hereNow?: PersonData;
  /** Друзья/сеть бывали здесь, а ты ещё нет — синий контур */
  friendsHaveBeen: boolean;
}

/** Узел места на графе профиля (шестиугольник) */
export interface GraphPlaceNodeData {
  nodeType: 'place';
  id: string;
  shortLabel: string;
  fullTitle: string;
  placeId: string;
  visitCount: number;
  people: PersonData[];
}

/** Person shown on match / connection screens (richer than feed PersonData) */
export interface MatchPersonData {
  id: string;
  name: string;
  /** One line, e.g. "КГТУ · 2 курс" */
  subtitle: string;
  bio: string;
  initials: string;
}

/** One event node on the profile graph */
export interface GraphEventNodeData {
  nodeType?: 'event';
  id: string;
  shortLabel: string;
  fullTitle: string;
  dateLabel: string;
  connectionCount: number;
  isUpcoming: boolean;
  /** Feed event ids that merge into this graph node */
  feedEventIds: string[];
  people: PersonData[];
}

export type ProfileGraphNode = GraphEventNodeData | GraphPlaceNodeData;
