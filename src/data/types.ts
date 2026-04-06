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

export type NotificationKind = 'onboarding' | 'fomo';

export interface NotificationData {
  id: string;
  icon: string;
  text: string;
  time: string;
  isRead: boolean;
  kind?: NotificationKind;
  /** For FOMO: opens match moment for this feed event */
  eventId?: string;
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
