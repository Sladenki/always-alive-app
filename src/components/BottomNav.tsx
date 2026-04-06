import { Map, Zap, Calendar, Bell, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'feed', icon: Zap, label: 'Сейчас' },
  { id: 'map', icon: Map, label: 'Карта' },
  { id: 'myevents', icon: Calendar, label: 'Я иду' },
  { id: 'notifications', icon: Bell, label: 'Уведомления' },
  { id: 'profile', icon: User, label: 'Профиль' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/30">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              activeTab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
