import { useState, useEffect } from 'react';
import { X, MessageCircle, Eye, ChevronRight, Check } from 'lucide-react';
import { mockDayRoute, mockNearMisses, getTotalDistance } from '@/data/dayRouteData';
import { appendSavedDayRoute } from '@/lib/savedDayRoutes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PrivacyMode } from '@/components/OnboardingFlow';

const DIGEST_KEY = 'nexus_digest_last';

function todayKey() { return new Date().toISOString().slice(0, 10); }

function shouldShowDigest(): boolean {
  const h = new Date().getHours();
  if (h < 19) return false;
  try {
    return localStorage.getItem(DIGEST_KEY) !== todayKey();
  } catch { return true; }
}

function markDigestShown() {
  try { localStorage.setItem(DIGEST_KEY, todayKey()); } catch {}
}

const DAYS_RU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

interface Props {
  privacyMode: PrivacyMode;
  onSaveDay: () => void;
}

export default function EveningDigest({ privacyMode, onSaveDay }: Props) {
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (shouldShowDigest()) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  const now = new Date();
  const dayLabel = `${DAYS_RU[now.getDay()]}, ${now.getDate()}.${String(now.getMonth() + 1).padStart(2, '0')}`;

  const allNearMiss = mockNearMisses.flatMap((nm) => {
    const stop = mockDayRoute.find((s) => s.id === nm.stopId);
    return nm.people.map((p) => ({ ...p, stopLabel: stop?.label || '', stopTime: stop?.startTime || '' }));
  });

  const close = () => {
    markDigestShown();
    setShow(false);
  };

  const handleSave = () => {
    appendSavedDayRoute(mockDayRoute.map((s) => ({ id: s.id, icon: s.icon, label: s.label })));
    setSaved(true);
    onSaveDay();
    toast.success('+2 XP · День сохранён', { description: `+${mockDayRoute.length} точек в граф` });
  };

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col bg-background/98 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-md w-full mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Твой день · {dayLabel}</h2>
          </div>
          <button type="button" onClick={close} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Route */}
        <section className="rounded-2xl glass p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">📍 Маршрут дня</h3>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {mockDayRoute.map((stop, i) => (
              <div key={stop.id} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-lg">{stop.icon}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[60px] text-center truncate">{stop.label}</span>
                  <span className="text-[9px] text-muted-foreground/60">{stop.startTime}</span>
                </div>
                {i < mockDayRoute.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground/30 mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground mt-3">
            {mockDayRoute.length} мест · {getTotalDistance()} км · с {mockDayRoute[0]?.startTime} до {mockDayRoute[mockDayRoute.length - 1]?.endTime}
          </p>
        </section>

        {/* Section 2: Near misses */}
        <section className="rounded-2xl glass p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">👥 Почти встретились</h3>
          <div className="space-y-3">
            {allNearMiss.map((person) => (
              <div key={person.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <img src={person.avatarUrl} alt={person.name} className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{person.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {person.stopLabel} · {person.timeLabel}
                  </p>
                  <p className="text-[10px] text-amber-400/80">{person.deltaLabel}</p>
                </div>
                {/* Near-miss mini viz */}
                <svg width="40" height="28" viewBox="0 0 40 28" className="shrink-0">
                  <line x1="4" y1="14" x2="18" y2="14" stroke="hsl(168 76% 42%)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="14" x2="36" y2="14" stroke="hsl(263 70% 50%)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="20" cy="14" r="3" fill="#f59e0b" className="animate-pulse-subtle" />
                </svg>
                <button
                  type="button"
                  onClick={() => toast('Скоро!')}
                  className="shrink-0 p-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  {privacyMode === 'open' ? <MessageCircle className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Save day */}
        <section className="rounded-2xl glass p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">💾 Сохранить день</h3>
          <p className="text-[12px] text-muted-foreground mb-3">Добавить сегодняшние места в граф?</p>
          {saved ? (
            <div className="flex items-center gap-2 text-teal-400 text-sm font-medium animate-fade-up">
              <Check className="w-4 h-4" />
              День сохранён · +{mockDayRoute.length} точек
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-transform active:scale-[0.97]"
              >
                ✓ Сохранить день
              </button>
              <button
                type="button"
                onClick={close}
                className="px-4 py-3 text-sm text-muted-foreground font-medium"
              >
                Пропустить
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/40">
          Nexus · каждый вечер в 19:00
        </p>
      </div>
    </div>
  );
}
