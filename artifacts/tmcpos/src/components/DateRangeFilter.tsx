import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onFilter: (from: string, to: string) => void;
  className?: string;
}

export function DateRangeFilter({ onFilter, className }: DateRangeFilterProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const hasFilter = from || to;

  const apply = () => onFilter(from, to);

  const reset = () => {
    setFrom("");
    setTo("");
    onFilter("", "");
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <CalendarDays size={13} />
        <span>Filter Tanggal:</span>
      </div>
      <Input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="w-36 h-8 text-xs"
        title="Dari tanggal"
      />
      <span className="text-xs text-muted-foreground">—</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-36 h-8 text-xs"
        title="Sampai tanggal"
      />
      <Button
        size="sm"
        variant="secondary"
        className="h-8 text-xs px-3"
        onClick={apply}
      >
        Terapkan
      </Button>
      {hasFilter && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
          onClick={reset}
        >
          <X size={12} className="mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}

export function filterByDateRange<T extends { createdAt: string }>(
  items: T[],
  from: string,
  to: string,
): T[] {
  if (!from && !to) return items;
  return items.filter((item) => {
    const date = new Date(item.createdAt);
    if (from && date < new Date(from)) return false;
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      if (date > toEnd) return false;
    }
    return true;
  });
}
