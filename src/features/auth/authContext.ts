import { createContext, useContext } from "react";
import type { AuthUser } from "./auth.api";

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isInitializing: boolean;
  initializationError: string | null;
  canRetryInitialization: boolean;
  retryInitialization: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Centralize access to auth state/actions and fail clearly if the provider is missing.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
