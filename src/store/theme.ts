"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  apply: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggle: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
        }
      },
      apply: () => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", get().theme === "dark");
        }
      },
    }),
    { name: "cca-theme" },
  ),
);
