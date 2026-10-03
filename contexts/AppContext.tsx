"use client";

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { CurrentUser } from "@/types/auth";
import {
  DUMMY_CURRENT_USER,
  getCurrentUserJson,
  parseCurrentUser,
  subscribeToAuthChanges,
} from "@/config/dummyAuth";

interface AppContextValue {
  /** User yang sedang login (sementara dari dummy config) */
  currentUser: CurrentUser;
  /** Apakah sidebar mobile sedang terbuka */
  isMobileSidebarOpen: boolean;
  /** Toggle sidebar mobile */
  toggleMobileSidebar: () => void;
  /** Tutup sidebar mobile */
  closeMobileSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const storedUser = useSyncExternalStore(
    subscribeToAuthChanges,
    getCurrentUserJson,
    () => null,
  );
  const [verifiedUser, setVerifiedUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const result = await response.json() as { user?: CurrentUser };
        return result.user && parseCurrentUser(JSON.stringify(result.user)) ? result.user : null;
      })
      .then((user) => { if (isCurrent) setVerifiedUser(user); })
      .catch(() => { if (isCurrent) setVerifiedUser(null); });
    return () => { isCurrent = false; };
  }, [storedUser]);

  const currentUser = verifiedUser ?? DUMMY_CURRENT_USER;

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp harus digunakan di dalam AppProvider");
  }
  return context;
}
