import { onboardingNotifications, placeNotificationsMock } from '@/data/mockData';
import { useAppState } from '@/contexts/AppStateContext';
import type { NotificationData, NotificationKind } from '@/data/types';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface NotificationsPageProps {
  onOpenMatch?: (eventId: string) => void;
  onOpenMapPlace?: (placeId: string) => void;
  onOpenPlaceSheet?: (placeId: string) => void;
  onOpenPlaceMatch?: (placeId: string) => void;
}

function isPlaceNotificationKind(k: NotificationKind | undefined): boolean {
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

  const handleRowClick = (notif: NotificationData) => {
    if (notif.kind === 'fomo' && notif.eventId) {
      markNotificationRead(notif.id);
      onOpenMatch?.(notif.eventId);
      return;
    }
    if (notif.kind === 'place_map' && notif.placeId) {
      markNotificationRead(notif.id);
      onOpenMapPlace?.(notif.placeId);
      return;
    }
    if (notif.kind === 'place_sheet' && notif.placeId) {
      markNotificationRead(notif.id);
      onOpenPlaceSheet?.(notif.placeId);
      return;
    }
    if (notif.kind === 'place_match' && notif.placeId) {
      markNotificationRead(notif.id);
      onOpenPlaceMatch?.(notif.placeId);
    }
  };

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
          const isPlace = isPlaceNotificationKind(notif.kind);
          const isClickable = isFomo || isPlace;
          const isUnread = !notif.isRead;
          const isSpring = springId === notif.id;
          const iconIsFire = notif.icon === '🔥';
          return (
            <div
              key={notif.id}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={() => isClickable && handleRowClick(notif)}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleRowClick(notif);
                }
              }}
              className={`w-full text-left glass rounded-xl p-4 flex items-start gap-3 ${
                isSpring ? 'animate-notif-enter' : 'animate-fade-up'
              } ${
                isClickable
                  ? `cursor-pointer transition-[transform] duration-150 active:scale-[0.99] ${
                      isPlace
                        ? 'border border-teal-500/25 hover:bg-teal-500/5'
                        : 'border border-[#7c3aed]/25 hover:bg-[#7c3aed]/5'
                    }`
                  : ''
              } ${
                isUnread
                  ? isFomo
                    ? 'border-l-[3px] border-l-[#7c3aed] bg-[#7c3aed]/10'
                    : isPlace
                      ? 'border-l-[3px] border-l-teal-500 bg-teal-500/5'
                      : 'border-l-[3px] border-l-muted'
                  : ''
              }`}
              style={{ animationDelay: isSpring ? undefined : `${i * 100}ms` }}
            >
              <span className={`text-xl shrink-0 ${iconIsFire ? 'inline-flex animate-icon-fire-intro' : ''}`}>
                {notif.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{notif.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
              {isUnread && (
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    isFomo ? 'bg-[#7c3aed]' : isPlace ? 'bg-teal-400' : 'bg-muted-foreground'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
