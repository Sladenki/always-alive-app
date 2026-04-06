import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import type { NotificationData, PersonData } from '@/data/types';
import { demoMatchPerson } from '@/data/mockData';

const FOMO_DATE_KEY = 'nexus_fomo_last_sent_date';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function canSendFomoToday(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(FOMO_DATE_KEY) !== todayKey();
  } catch {
    return true;
  }
}

function markFomoSentToday(): void {
  try {
    localStorage.setItem(FOMO_DATE_KEY, todayKey());
  } catch {
    /* ignore */
  }
}

interface AppStateContextType {
  signedUpEventIds: Set<string>;
  signUpForEvent: (eventId: string) => void;
  isSignedUp: (eventId: string) => boolean;
  /** People you met at a feed event (by event id) */
  eventAcquaintances: Record<string, PersonData[]>;
  addAcquaintanceAtEvent: (eventId: string, person: PersonData) => void;
  getAcquaintancesForEvent: (eventId: string) => PersonData[];
  fomoNotifications: NotificationData[];
  markNotificationRead: (id: string) => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

function matchPersonToPersonData(): PersonData {
  return {
    id: demoMatchPerson.id,
    name: demoMatchPerson.name,
    role: demoMatchPerson.subtitle,
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [signedUpEventIds, setSignedUpEventIds] = useState<Set<string>>(new Set());
  const [eventAcquaintances, setEventAcquaintances] = useState<Record<string, PersonData[]>>({});
  const [fomoNotifications, setFomoNotifications] = useState<NotificationData[]>([]);
  const fomoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fomoTimerRef.current) clearTimeout(fomoTimerRef.current);
    };
  }, []);

  const scheduleFomoDemo = useCallback((newEventId: string, nextSigned: Set<string>) => {
    if (fomoTimerRef.current) {
      clearTimeout(fomoTimerRef.current);
      fomoTimerRef.current = null;
    }
    if (!canSendFomoToday()) return;
    const workshopId = 'e4';
    const shouldOffer =
      newEventId === workshopId || (nextSigned.has(workshopId) && newEventId !== workshopId);
    if (!shouldOffer) return;

    fomoTimerRef.current = setTimeout(() => {
      fomoTimerRef.current = null;
      if (!canSendFomoToday()) return;
      markFomoSentToday();
      const n: NotificationData = {
        id: `fomo-${Date.now()}`,
        icon: '✨',
        text: 'Алина тоже идёт на Воркшоп по дизайну — познакомиться?',
        time: 'только что',
        isRead: false,
        kind: 'fomo',
        eventId: workshopId,
      };
      setFomoNotifications((prev) => [n, ...prev]);
    }, 2600);
  }, []);

  const signUpForEvent = useCallback(
    (eventId: string) => {
      setSignedUpEventIds((prev) => {
        const next = new Set(prev).add(eventId);
        scheduleFomoDemo(eventId, next);
        return next;
      });
    },
    [scheduleFomoDemo],
  );

  const isSignedUp = useCallback(
    (eventId: string) => {
      return signedUpEventIds.has(eventId);
    },
    [signedUpEventIds],
  );

  const addAcquaintanceAtEvent = useCallback((eventId: string, person: PersonData) => {
    setEventAcquaintances((prev) => {
      const cur = prev[eventId] ?? [];
      if (cur.some((p) => p.id === person.id)) return prev;
      return { ...prev, [eventId]: [...cur, person] };
    });
  }, []);

  const getAcquaintancesForEvent = useCallback(
    (eventId: string) => {
      return eventAcquaintances[eventId] ?? [];
    },
    [eventAcquaintances],
  );

  const markNotificationRead = useCallback((id: string) => {
    setFomoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        signedUpEventIds,
        signUpForEvent,
        isSignedUp,
        eventAcquaintances,
        addAcquaintanceAtEvent,
        getAcquaintancesForEvent,
        fomoNotifications,
        markNotificationRead,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export { matchPersonToPersonData };
