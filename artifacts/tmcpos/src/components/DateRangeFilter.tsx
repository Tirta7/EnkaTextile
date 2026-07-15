import { useState } from "react";
import { CalendarDays, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onFilter: (from: string, to: string) => void;
  className?: string;
}

export function DateRangeFilter({ onFilter, className }: DateRangeFilterProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const hasFilter = from || to;

  const apply = () => {
    onFilter(from, to);
    setIsOpen(false);
  };

  const reset = () => {
    setFrom("");
    setTo("");
    onFilter("", "");
    setIsOpen(false);
  };

  const displayRange = hasFilter 
    ? `${from ? new Date(from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Awal'} - ${to ? new Date(to).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Akhir'}`
    : "Filter Tanggal";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("h-11 sm:h-10 w-full sm:w-auto rounded-2xl sm:rounded-full bg-white border-slate-200 px-4 flex items-center justify-between shadow-sm text-slate-700 hover:bg-slate-50 transition-colors shrink-0", className)}
        >
          <div className="flex items-center gap-2.5">
            <CalendarDays size={18} className="text-violet-500" />
            <span className="text-sm font-medium">{displayRange}</span>
          </div>
          {hasFilter ? (
            <div 
              className="p-1 rounded-full hover:bg-slate-200/60 transition-colors bg-slate-100/50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                reset();
              }}
            >
              <X size={14} className="text-slate-500" />
            </div>
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-[calc(100vw-32px)] sm:w-80 p-5 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 z-300">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CalendarDays size={18} className="text-violet-500" />
            <h4 className="font-semibold text-slate-800 text-sm">Pilih Rentang Tanggal</h4>
          </div>
          
          <div className="flex flex-col gap-4 pt-1">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dari Tanggal</label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-11 w-full text-sm bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-violet-500 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sampai Tanggal</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-11 w-full text-sm bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-violet-500 shadow-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10 border-slate-200 text-slate-600 font-semibold"
              onClick={reset}
            >
              Reset
            </Button>
            <Button
              className="flex-1 rounded-xl h-10 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 font-semibold"
              onClick={apply}
            >
              Terapkan
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
