import { Bell, Calendar, Map, User, Zap, type LucideIcon } from 'lucide-react';

export type TabId = 'feed' | 'map' | 'myevents' | 'notifications' | 'profile';

export interface TabItem {
  id: TabId;
  icon: LucideIcon;
  label: string;
}

export const APP_TABS: TabItem[] = [
  { id: 'feed', icon: Zap, label: 'Сейчас' },
  { id: 'map', icon: Map, label: 'Карта' },
  { id: 'myevents', icon: Calendar, label: 'Я иду' },
  { id: 'notifications', icon: Bell, label: 'Инбокс' },
  { id: 'profile', icon: User, label: 'Профиль' },
];
