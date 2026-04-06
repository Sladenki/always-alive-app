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

export interface NotificationData {
  id: string;
  icon: string;
  text: string;
  time: string;
  isRead: boolean;
}
