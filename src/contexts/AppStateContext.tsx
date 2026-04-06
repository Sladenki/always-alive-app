import { useState, createContext, useContext, ReactNode, useCallback } from 'react';

interface AppStateContextType {
  signedUpEventIds: Set<string>;
  signUpForEvent: (eventId: string) => void;
  isSignedUp: (eventId: string) => boolean;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [signedUpEventIds, setSignedUpEventIds] = useState<Set<string>>(new Set());

  const signUpForEvent = useCallback((eventId: string) => {
    setSignedUpEventIds(prev => new Set(prev).add(eventId));
  }, []);

  const isSignedUp = useCallback((eventId: string) => {
    return signedUpEventIds.has(eventId);
  }, [signedUpEventIds]);

  return (
    <AppStateContext.Provider value={{ signedUpEventIds, signUpForEvent, isSignedUp }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
