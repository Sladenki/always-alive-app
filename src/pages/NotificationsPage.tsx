import { onboardingNotifications, placeNotificationsMock } from '@/data/mockData';
import { useAppState } from '@/contexts/AppStateContext';
import type { NotificationData, NotificationKind } from '@/data/types';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface NotificationsPageProps {
  onOpenMatch?: (eventId: string) => void;
  onOpenMapPlace?: (placeId: string) => void;
  onOpenPlaceSheet?: (placeId: string) => void;
  onOpenPlaceMatch?: (placeId: string) => void;
}

function isPlaceKind(k: NotificationKind | undefined): boolean {
  return k === 'place_map' || k === 'place_sheet' || k === 'place_match';
}

export default function NotificationsPage({
  onOpenMatch,
  onOpenMapPlace,
  onOpenPlaceSheet,
  onOpenPlaceMatch,
}: NotificationsPageProps) {
  const { fomoNotifications, markNotificationRead, isNotificationRead } = useAppState();

  const all: NotificationData[] = useMemo(() => {
    const merged = [...fomoNotifications, ...placeNotificationsMock, ...onboardingNotifications];
    return merged.map((n) => ({
      ...n,
      isRead: isNotificationRead(n.id, n.isRead),
    }));
  }, [fomoNotifications, isNotificationRead]);

  const prevFirstRef = useRef<string | undefined>(undefined);
  const [springId, setSpringId] = useState<string | null>(null);

  useEffect(() => {
    const first = all[0];
    if (!first) { prevFirstRef.current = undefined; return; }
    const prev = prevFirstRef.current;
    if (first.kind === 'fomo' && prev !== undefined && first.id !== prev) {
      setSpringId(first.id);
      const t = window.setTimeout(() => setSpringId(null), 480);
      prevFirstRef.current = first.id;
      return () => clearTimeout(t);
    }
    prevFirstRef.current = first.id;
  }, [all]);

  const handleClick = (n: NotificationData) => {
    if (n.kind === 'fomo' && n.eventId) { markNotificationRead(n.id); onOpenMatch?.(n.eventId); return; }
    if (n.kind === 'place_map' && n.placeId) { markNotificationRead(n.id); onOpenMapPlace?.(n.placeId); return; }
    if (n.kind === 'place_sheet' && n.placeId) { markNotificationRead(n.id); onOpenPlaceSheet?.(n.placeId); return; }
    if (n.kind === 'place_match' && n.placeId) { markNotificationRead(n.id); onOpenPlaceMatch?.(n.placeId); }
  };

  if (all.length === 0) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Уведомления</h1>
        <div className="text-center py-16 animate-fade-up">
          <div className="mx-auto mb-4 w-fit animate-bell-ring-intro">
            <Bell className="w-11 h-11 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-foreground font-semibold text-lg">Пока тихо</p>
          <p className="text-sm text-muted-foreground mt-1">Но город не спит</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Уведомления</h1>
      <div className="space-y-2">
        {all.map((notif, i) => {
          const isFomo = notif.kind === 'fomo';
          const isPlace = isPlaceKind(notif.kind);
          const clickable = isFomo || isPlace;
          const unread = !notif.isRead;
          const isSpring = springId === notif.id;

          return (
            <div
              key={notif.id}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={() => clickable && handleClick(notif)}
              onKeyDown={(e) => {
                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleClick(notif);
                }
              }}
              className={cn(
                'w-full text-left rounded-2xl p-4 flex items-start gap-3 glass transition-all',
                isSpring ? 'animate-notif-enter' : 'animate-fade-up',
                clickable && 'cursor-pointer active:scale-[0.98] glass-hover',
                unread && isFomo && 'border-l-[3px] border-l-violet bg-violet/5',
                unread && isPlace && 'border-l-[3px] border-l-teal bg-teal/5',
                unread && !isFomo && !isPlace && 'border-l-[3px] border-l-muted',
              )}
              style={{ animationDelay: isSpring ? undefined : `${i * 0.06}s` }}
            >
              <span className={cn(
                'text-xl shrink-0',
                notif.icon === '🔥' && 'animate-icon-fire-intro',
              )}>
                {notif.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{notif.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
              {unread && (
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2 shrink-0',
                  isFomo ? 'bg-violet' : isPlace ? 'bg-teal' : 'bg-muted-foreground',
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
