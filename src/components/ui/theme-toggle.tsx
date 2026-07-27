"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  const classes = className
    ? className
    : "absolute top-4 right-4 z-50 rounded-full shadow-md";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Cambiar tema"
      className={classes}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
