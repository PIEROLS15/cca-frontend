"use client";

import { useEffect } from "react";
import { useTheme } from "@/store/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const apply = useTheme((s) => s.apply);

  useEffect(() => {
    apply();
  }, [apply]);

  return <>{children}</>;
}
