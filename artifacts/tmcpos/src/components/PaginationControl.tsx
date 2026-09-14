import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center gap-0.5">
      {/* Prev */}
      <button
        onClick={() => hasPrev && onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        aria-label="Halaman sebelumnya"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-xl text-sm transition-all duration-150 select-none active:scale-90",
          hasPrev
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            : "text-slate-200 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-label={`Halaman ${p}`}
          aria-current={currentPage === p ? "page" : undefined}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-xl text-[13px] font-semibold transition-all duration-150 select-none active:scale-90",
            currentPage === p
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => hasNext && onPageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Halaman berikutnya"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-xl text-sm transition-all duration-150 select-none active:scale-90",
          hasNext
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            : "text-slate-200 cursor-not-allowed"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}


