"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import type { PresetKey } from "@/lib/dashboard-utils";
import { presets, presetRange, rangeLabel } from "@/lib/dashboard-utils";

interface RangeFilterProps {
  preset: PresetKey;
  range: DateRange;
  onChange: (preset: PresetKey, range: DateRange) => void;
}

export function RangeFilter({ preset, range, onChange }: RangeFilterProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
      <Select
        value={preset}
        onValueChange={(v) => {
          const p = v as PresetKey;
          if (p === "custom") {
            onChange(p, range);
            setOpen(true);
          } else {
            onChange(p, presetRange(p));
          }
        }}
      >
        <SelectTrigger className="h-8 w-full sm:w-37.5 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs font-normal justify-start gap-2 w-full sm:w-auto min-w-0",
              !range.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{rangeLabel(range)}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              if (r) onChange("custom", r);
            }}
            numberOfMonths={2}
            initialFocus
            locale={es}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
