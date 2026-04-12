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
import { demoMatchPerson, initialPlaceVisitCounts } from '@/data/mockData';

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
  eventAcquaintances: Record<string, PersonData[]>;
  addAcquaintanceAtEvent: (eventId: string, person: PersonData) => void;
  getAcquaintancesForEvent: (eventId: string) => PersonData[];

  placeVisitCounts: Record<string, number>;
  getPlaceVisitCount: (placeId: string) => number;
  /** Текущий чек-ин в месте (+1) */
  incrementPlaceVisit: (placeId: string) => void;

  placeAcquaintances: Record<string, PersonData[]>;
  addAcquaintanceAtPlace: (placeId: string, person: PersonData) => void;
  getAcquaintancesForPlace: (placeId: string) => PersonData[];

  fomoNotifications: NotificationData[];
  markNotificationRead: (id: string) => void;
  isNotificationRead: (id: string, fallbackRead: boolean) => boolean;
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
  const [placeVisitCounts, setPlaceVisitCounts] = useState<Record<string, number>>(() => ({
    ...initialPlaceVisitCounts,
  }));
  const [placeAcquaintances, setPlaceAcquaintances] = useState<Record<string, PersonData[]>>({});
  const [fomoNotifications, setFomoNotifications] = useState<NotificationData[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Record<string, boolean>>({});
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
        text: 'Катя тоже идёт на воркшоп по UI/UX — познакомиться?',
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

  const incrementPlaceVisit = useCallback((placeId: string) => {
    setPlaceVisitCounts((prev) => ({
      ...prev,
      [placeId]: (prev[placeId] ?? 0) + 1,
    }));
  }, []);

  const getPlaceVisitCount = useCallback(
    (placeId: string) => {
      return placeVisitCounts[placeId] ?? 0;
    },
    [placeVisitCounts],
  );

  const addAcquaintanceAtPlace = useCallback((placeId: string, person: PersonData) => {
    setPlaceAcquaintances((prev) => {
      const cur = prev[placeId] ?? [];
      if (cur.some((p) => p.id === person.id)) return prev;
      return { ...prev, [placeId]: [...cur, person] };
    });
  }, []);

  const getAcquaintancesForPlace = useCallback(
    (placeId: string) => {
      return placeAcquaintances[placeId] ?? [];
    },
    [placeAcquaintances],
  );

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => ({ ...prev, [id]: true }));
    setFomoNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const isNotificationRead = useCallback((id: string, fallbackRead: boolean) => {
    return readNotificationIds[id] === true || fallbackRead;
  }, [readNotificationIds]);

  return (
    <AppStateContext.Provider
      value={{
        signedUpEventIds,
        signUpForEvent,
        isSignedUp,
        eventAcquaintances,
        addAcquaintanceAtEvent,
        getAcquaintancesForEvent,
        placeVisitCounts,
        incrementPlaceVisit,
        getPlaceVisitCount,
        placeAcquaintances,
        addAcquaintanceAtPlace,
        getAcquaintancesForPlace,
        fomoNotifications,
        markNotificationRead,
        isNotificationRead,
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
