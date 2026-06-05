"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function usePaginationSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const readParam = useCallback(
    (key: string): string | null => searchParams.get(key),
    [searchParams],
  );

  const readNumParam = useCallback(
    (key: string, defaultVal: number): number => {
      const val = searchParams.get(key);
      if (val === null) return defaultVal;
      const n = Number(val);
      return Number.isNaN(n) || n < 1 ? defaultVal : n;
    },
    [searchParams],
  );

  const readBoolParam = useCallback(
    (key: string): boolean | undefined => {
      const val = searchParams.get(key);
      if (val === null) return undefined;
      return val === "true";
    },
    [searchParams],
  );

  const syncToUrl = useCallback(
    (params: Record<string, string | number | boolean | undefined | null>) => {
      const sp = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "" && value !== false) {
          sp.set(key, String(value));
        }
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return { readParam, readNumParam, readBoolParam, syncToUrl };
}
