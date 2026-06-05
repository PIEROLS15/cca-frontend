import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PageItem = number | "...";

interface PaginationControlsProps {
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}

function getPageList(page: number, totalPages: number): PageItem[] {
  const pages: PageItem[] = [1];

  if (totalPages <= 1) {
    return pages;
  }

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    pages.push("...");
  }

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

export function PaginationControls({
  page,
  limit,
  totalItems,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 25, 50],
}: PaginationControlsProps) {
  const [goToValue, setGoToValue] = useState("");

  if (totalItems <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const startItem = (safePage - 1) * limit + 1;
  const endItem = Math.min(safePage * limit, totalItems);
  const pageList = getPageList(safePage, totalPages);

  function handleGoToPage() {
    const target = Number(goToValue);
    if (target >= 1 && target <= totalPages) {
      onPageChange(target);
    }
    setGoToValue("");
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Mostrando <span className="font-medium text-foreground">{startItem}</span>-<span className="font-medium text-foreground">{endItem}</span> de <span className="font-medium text-foreground">{totalItems}</span>
        </span>

        <div className="hidden items-center gap-1.5 sm:flex">
          <span>Filas:</span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger className="h-7 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={safePage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageList.map((pageItem, index) =>
            pageItem === "..." ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageItem}
                type="button"
                variant={pageItem === safePage ? "default" : "ghost"}
                size="sm"
                className="h-8 min-w-8 px-2 tabular-nums"
                onClick={() => onPageChange(pageItem)}
              >
                {pageItem}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={safePage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <div className="ml-2 flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={goToValue}
              onChange={(e) => setGoToValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGoToPage(); }}
              className="h-8 w-16 min-w-0 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="..."
              style={{ width: `${Math.max(4, goToValue.length + 1)}rem` }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleGoToPage}
              disabled={!goToValue}
            >
              Ir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
