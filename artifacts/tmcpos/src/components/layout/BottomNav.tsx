import { Home, Receipt, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Penjualan", href: "/penjualan", icon: Receipt },
    { name: "Laporan", href: "/laporan", icon: BarChart3 },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border/50 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-16">
                <div
                  className={cn(
                    "p-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
