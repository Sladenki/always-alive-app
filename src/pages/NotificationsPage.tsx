import { onboardingNotifications } from '@/data/mockData';
import { useAppState } from '@/contexts/AppStateContext';
import type { NotificationData } from '@/data/types';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface NotificationsPageProps {
  /** FOMO: open match moment for event */
  onOpenMatch?: (eventId: string) => void;
}

export default function NotificationsPage({ onOpenMatch }: NotificationsPageProps) {
  const { fomoNotifications, markNotificationRead } = useAppState();

  const all: NotificationData[] = useMemo(
    () => [...fomoNotifications, ...onboardingNotifications],
    [fomoNotifications],
  );
  const prevFirstRef = useRef<string | undefined>(undefined);
  const [springId, setSpringId] = useState<string | null>(null);

  useEffect(() => {
    const first = all[0];
    if (!first) {
      prevFirstRef.current = undefined;
      return;
    }
    const prev = prevFirstRef.current;
    if (first.kind === 'fomo' && prev !== undefined && first.id !== prev) {
      setSpringId(first.id);
      const t = window.setTimeout(() => setSpringId(null), 480);
      prevFirstRef.current = first.id;
      return () => clearTimeout(t);
    }
    prevFirstRef.current = first.id;
  }, [all]);

  if (all.length === 0) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-5">Уведомления</h1>
        <div className="text-center py-14 animate-fade-up">
          <div className="mx-auto mb-4 w-fit origin-top animate-bell-ring-intro">
            <Bell className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-foreground font-medium text-lg">Пока тихо — но город не спит</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">Уведомления</h1>
      <div className="space-y-3">
        {all.map((notif, i) => {
          const isFomo = notif.kind === 'fomo';
          const isUnread = !notif.isRead;
          const isSpring = springId === notif.id;
          const iconIsFire = notif.icon === '🔥';
          return (
            <div
              key={notif.id}
              role={isFomo ? 'button' : undefined}
              tabIndex={isFomo ? 0 : undefined}
              onClick={() => {
                if (isFomo && notif.eventId) {
                  markNotificationRead(notif.id);
                  onOpenMatch?.(notif.eventId);
                }
              }}
              onKeyDown={(e) => {
                if (isFomo && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  if (notif.eventId) {
                    markNotificationRead(notif.id);
                    onOpenMatch?.(notif.eventId);
                  }
                }
              }}
              className={`w-full text-left glass rounded-xl p-4 flex items-start gap-3 ${
                isSpring ? 'animate-notif-enter' : 'animate-fade-up'
              } ${
                isFomo
                  ? 'cursor-pointer border border-[#7c3aed]/25 hover:bg-[#7c3aed]/5 transition-[transform] duration-150 active:scale-[0.99]'
                  : ''
              } ${isUnread ? 'border-l-[3px] border-l-[#7c3aed] bg-[#7c3aed]/10' : ''}`}
              style={{ animationDelay: isSpring ? undefined : `${i * 100}ms` }}
            >
              <span className={`text-xl shrink-0 ${iconIsFire ? 'inline-flex animate-icon-fire-intro' : ''}`}>
                {notif.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{notif.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
              {isUnread && <div className="w-2 h-2 rounded-full bg-[#7c3aed] mt-2 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
