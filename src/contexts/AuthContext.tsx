import { useState, createContext, useContext, ReactNode, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  userName: string;
  userRole: string;
  showAuthSheet: boolean;
  authPrompt: string;
  requestAuth: (prompt: string) => void;
  closeAuthSheet: () => void;
  login: (name: string, role: string) => void;
  startDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [authPrompt, setAuthPrompt] = useState('');

  const requestAuth = useCallback(
    (prompt: string) => {
      if (isAuthenticated && !isDemoMode) return;
      setAuthPrompt(prompt);
      setShowAuthSheet(true);
    },
    [isAuthenticated, isDemoMode],
  );

  const closeAuthSheet = useCallback(() => setShowAuthSheet(false), []);

  const login = useCallback((name: string, role: string) => {
    setUserName(name);
    setUserRole(role);
    setIsAuthenticated(true);
    setIsDemoMode(false);
    setShowAuthSheet(false);
  }, []);

  const startDemo = useCallback(() => {
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setUserName('МС');
    setUserRole('Студент КГТУ');
    setShowAuthSheet(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isDemoMode,
        userName,
        userRole,
        showAuthSheet,
        authPrompt,
        requestAuth,
        closeAuthSheet,
        login,
        startDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
