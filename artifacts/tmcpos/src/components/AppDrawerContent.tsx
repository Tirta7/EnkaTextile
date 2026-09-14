/**
 * AppDrawerContent — standar wrapper untuk semua Drawer/Sheet di TMCPos
 *
 * Aturan:
 * - Lebar: full device width, max 2xl (form) atau 4xl (detail/transaksi)
 * - Tinggi: max 95dvh dikurangi safe-area-inset-top → tidak menyentuh Dynamic Island
 * - Bottom padding: mengikuti safe-area-inset-bottom (home indicator iPhone)
 * - Tidak ada overflow keluar layar
 */

import { DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import React from "react";

type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeMap: Record<DrawerSize, string> = {
  sm:   "max-w-sm",
  md:   "max-w-2xl",
  lg:   "max-w-4xl",
  xl:   "max-w-6xl",
  full: "max-w-[95vw] xl:max-w-7xl",
};

interface AppDrawerContentProps {
  /** Ukuran lebar drawer. Default: "md" (max-w-2xl) */
  size?: DrawerSize;
  /** Class tambahan yang di-merge */
  className?: string;
  children: React.ReactNode;
}

export function AppDrawerContent({
  size = "md",
  className,
  children,
}: AppDrawerContentProps) {
  return (
    <DrawerContent
      className={cn(
        // Lebar responsif, tengah layar
        "mx-auto w-full",
        sizeMap[size],
        // Padding horizontal & bottom (safe-area-aware)
        "px-4 sm:px-6",
        "pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]",
        "pt-2",
        // Flex column agar konten bisa scroll internal
        "flex flex-col",
        className
      )}
      style={{
        // Tinggi max: 95% dynamic viewport dikurangi Dynamic Island / notch
        maxHeight: "calc(95dvh - env(safe-area-inset-top, 0px))",
      }}
    >
      {children}
    </DrawerContent>
  );
}
