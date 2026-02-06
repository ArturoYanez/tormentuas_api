import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  requiresPin: boolean;
  pendingUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<boolean>;
  disablePin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
