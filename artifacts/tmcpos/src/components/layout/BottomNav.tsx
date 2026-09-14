import { Home, Receipt, BarChart3, Settings, RefreshCcw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Beranda",    href: "/",          icon: Home },
    { name: "Retur",      href: "/retur",      icon: RefreshCcw },
    { name: "Penjualan",  href: "/penjualan",  icon: Receipt,   isPrimary: true },
    { name: "Laporan",    href: "/laporan",    icon: BarChart3 },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  return (
    <nav
      className={cn(
        "md:hidden flex-none w-full z-40",
        "bg-white/95 backdrop-blur-xl",
        "border-t border-slate-100",
        // safe area bottom iOS
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="flex items-stretch justify-around h-[56px]">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5",
                  "w-full h-full px-1 cursor-pointer select-none",
                  "transition-all duration-200 active:opacity-70",
                  // touch feedback
                  "tap-highlight-transparent"
                )}
              >
                {/* Active indicator bar di atas */}
                <span
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full transition-all duration-300",
                    isActive
                      ? item.isPrimary
                        ? "w-8 bg-violet-600"
                        : "w-6 bg-violet-500"
                      : "w-0 bg-transparent"
                  )}
                />

                {/* Icon container */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-xl transition-all duration-200",
                    item.isPrimary
                      ? cn(
                          "w-10 h-10",
                          isActive
                            ? "bg-violet-600 text-white"
                            : "bg-violet-50 text-violet-600"
                        )
                      : cn(
                          "w-8 h-8",
                          isActive
                            ? "text-violet-600"
                            : "text-muted-foreground"
                        )
                  )}
                >
                  <item.icon
                    className={cn(
                      "transition-all duration-200",
                      item.isPrimary ? "h-5 w-5" : "h-5 w-5"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[9px] font-semibold tracking-tight leading-none transition-colors duration-200",
                    isActive
                      ? "text-violet-600"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

