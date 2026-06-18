"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  onValueChange: (value: string) => void;
}

function normalizeText(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function SearchableSelect({
  value,
  options,
  placeholder = "Selecciona..",
  searchPlaceholder = "Escribe para buscar...",
  disabled,
  className,
  contentClassName,
  onValueChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const query = normalizeText(searchValue);
    if (!query) {
      return options;
    }

    return options.filter((option) => normalizeText(option.label).includes(query));
  }, [options, searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={open ? searchValue : selectedOption?.label || ""}
          onFocus={() => {
            if (disabled) return;
            setSearchValue("");
            setOpen(true);
          }}
          onClick={() => {
            if (disabled) return;
            setSearchValue("");
            setOpen(true);
          }}
          onChange={(event) => {
            setSearchValue(event.target.value);
            if (!open) {
              setOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setSearchValue("");
            }
          }}
          placeholder={placeholder || searchPlaceholder}
          disabled={disabled}
          autoComplete="off"
          className="pr-10"
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
      </div>

      {open && !disabled && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md",
            contentClassName,
          )}
        >
          <div className="max-h-60 overflow-y-auto p-1">
            <div className="space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  Sin resultados
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const active = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        active && "bg-accent text-accent-foreground",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onValueChange(option.value);
                        setSearchValue("");
                        setOpen(false);
                        window.setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                    >
                      <span className="truncate">{option.label}</span>
                      {active && <Check className="h-4 w-4" />}
                    </button>
                );
              })
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
