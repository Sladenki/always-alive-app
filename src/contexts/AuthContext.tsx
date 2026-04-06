import { useState, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string;
  userRole: string;
  showAuthSheet: boolean;
  authPrompt: string;
  requestAuth: (prompt: string) => void;
  closeAuthSheet: () => void;
  login: (name: string, role: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [authPrompt, setAuthPrompt] = useState('');

  const requestAuth = (prompt: string) => {
    if (isAuthenticated) return;
    setAuthPrompt(prompt);
    setShowAuthSheet(true);
  };

  const closeAuthSheet = () => setShowAuthSheet(false);

  const login = (name: string, role: string) => {
    setUserName(name);
    setUserRole(role);
    setIsAuthenticated(true);
    setShowAuthSheet(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, userRole, showAuthSheet, authPrompt, requestAuth, closeAuthSheet, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
