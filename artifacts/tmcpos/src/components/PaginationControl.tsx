import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

  // Logic to show max 5 pages
  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="py-0 sm:py-0">
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={cn("h-7 px-2 text-xs", currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
            />
          </PaginationItem>

          {visiblePages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={currentPage === p}
                onClick={() => onPageChange(p)}
                className="h-7 w-7 text-xs cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={cn("h-7 px-2 text-xs", currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
