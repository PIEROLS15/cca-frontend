"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { User } from "@/types/auth";
import { AuthService } from "@/services/auth.service";

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setSession: (user: User) => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {
    localStorage.removeItem("user");
  }
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const setSession = useCallback((newUser: User) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // siempre limpiamos aunque falle el backend
    }
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading: false,
      setSession,
      logout,
    }),
    [user, setSession, logout]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
