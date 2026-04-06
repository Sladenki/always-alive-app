import { onboardingNotifications } from '@/data/mockData';
import { useAppState } from '@/contexts/AppStateContext';
import type { NotificationData } from '@/data/types';

interface NotificationsPageProps {
  /** FOMO: open match moment for event */
  onOpenMatch?: (eventId: string) => void;
}

export default function NotificationsPage({ onOpenMatch }: NotificationsPageProps) {
  const { fomoNotifications, markNotificationRead } = useAppState();

  const all: NotificationData[] = [...fomoNotifications, ...onboardingNotifications];

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">Уведомления</h1>
      <div className="space-y-3">
        {all.map((notif, i) => {
          const isFomo = notif.kind === 'fomo';
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
              className={`w-full text-left glass rounded-xl p-4 flex items-start gap-3 animate-fade-up ${
                isFomo
                  ? 'cursor-pointer border border-[#7c3aed]/25 hover:bg-[#7c3aed]/5 active:scale-[0.99] transition-transform'
                  : ''
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-xl">{notif.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{notif.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#7c3aed] mt-2 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
