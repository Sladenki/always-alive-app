import { useState } from 'react';
import { cn } from '@/lib/utils';
import { APP_TABS, type TabId } from '@/config/navigation';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [popTab, setPopTab] = useState<TabId | null>(null);

  const handleTab = (id: TabId) => {
    setPopTab(id);
    window.setTimeout(() => setPopTab(null), 220);
    onTabChange(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="glass-solid border-t-0 rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
          {APP_TABS.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTab(id)}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground/70',
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/8" />
                )}
                <Icon
                  className={cn(
                    'relative w-[22px] h-[22px] transition-transform',
                    popTab === id && 'animate-nav-tab-icon-pop',
                    isActive && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]',
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className={cn(
                  'relative text-[10px] transition-all',
                  isActive ? 'font-semibold' : 'font-medium',
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
