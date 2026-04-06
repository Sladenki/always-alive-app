import { onboardingNotifications } from '@/data/mockData';

export default function NotificationsPage() {
  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">Уведомления</h1>
      <div className="space-y-3">
        {onboardingNotifications.map((notif, i) => (
          <div
            key={notif.id}
            className="glass rounded-xl p-4 flex items-start gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="text-xl">{notif.icon}</span>
            <div className="flex-1">
              <p className="text-sm text-foreground">{notif.text}</p>
              <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
            </div>
            {!notif.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
