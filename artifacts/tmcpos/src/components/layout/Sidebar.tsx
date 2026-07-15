import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package2,
  Tags,
  UserCircle2,
  Building2,
  Receipt,
  ShoppingBasket,
  ArrowLeftRight,
  Landmark,
  CreditCard,
  BookMarked,
  BarChart3,
  Zap,
  X,
  Settings,
  LogOut,
  Home,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

const navigation = [
  {
    title: "Overview",
    requiredRoles: ["admin", "kasir"],
    items: [
      { name: "Menu Utama", href: "/", icon: Home, requiredRoles: ["admin", "kasir"] },
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiredRoles: ["admin"] },
    ]
  },
  {
    title: "Master Data",
    requiredRoles: ["admin", "kasir"],
    items: [
      { name: "Kategori", href: "/kategori", icon: Tags },
      { name: "Barang", href: "/barang", icon: Package2 },
      { name: "Pelanggan", href: "/pelanggan", icon: UserCircle2 },
      { name: "Supplier", href: "/supplier", icon: Building2 },
    ]
  },
  {
    title: "Transaksi",
    requiredRoles: ["admin", "kasir"],
    items: [
      { name: "Penjualan", href: "/penjualan", icon: Receipt },
      { name: "Pembelian", href: "/pembelian", icon: ShoppingBasket },
      { name: "Mutasi Stok", href: "/mutasi", icon: ArrowLeftRight },
    ]
  },
  {
    title: "Keuangan",
    requiredRoles: ["admin", "kasir"],
    items: [
      { name: "Piutang", href: "/piutang", icon: Landmark },
      { name: "Hutang", href: "/hutang", icon: CreditCard },
      { name: "Buku Kas", href: "/buku-kas", icon: BookMarked },
    ]
  },
  {
    title: "Laporan & Pengaturan",
    requiredRoles: ["admin"],
    items: [
      { name: "Laporan", href: "/laporan", icon: BarChart3 },
      { name: "Pengaturan", href: "/pengaturan", icon: Settings },
      { name: "Karyawan", href: "/karyawan", icon: UserCircle2 },
    ]
  }
];

export function Sidebar({ isOpen, setOpen }: { isOpen: boolean; setOpen: (open: boolean) => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const appName = settings?.["app_name"] || "EnkaTextile";
  const appLogo = settings?.["app_logo"];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 flex flex-col border-r border-white/10",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(180deg, #1a1832 0%, #131226 60%, #0c0b1a 100%)",
        }}
      >
        {/* Brand */}
        <div
          className="h-[calc(64px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center px-5 pl-[max(1.25rem,env(safe-area-inset-left))] border-b border-white/5 shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden"
              style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
            >
              {appLogo ? (
                <img src={appLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Zap size={17} className="text-white" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[17px] tracking-tight leading-none">{appName}</div>
              <div className="text-[9px] text-white/25 tracking-[0.15em] uppercase mt-0.5 truncate max-w-[150px]">Virtual Operational Control</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 lg:hidden text-white/40 hover:text-white hover:bg-white/10 shrink-0"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-5">
          <nav className="px-3 space-y-6">
            {navigation
              .filter(group => !group.requiredRoles || group.requiredRoles.includes(user?.role as string || 'admin'))
              .map((group) => (
              <div key={group.title}>
                <h4 className="px-3 text-[10px] font-semibold text-white/25 uppercase tracking-[0.18em] mb-2">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {group.items
                    .filter(item => !item.requiredRoles || item.requiredRoles.includes(user?.role as string || 'admin'))
                    .map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
                            isActive
                              ? "text-white"
                              : "text-white/60 hover:text-white/90 hover:bg-white/10"
                          )}
                          style={isActive ? {
                            background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.15) 100%)",
                            boxShadow: "0 0 24px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
                          } : {}}
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                              isActive
                                ? "text-white"
                                : "text-white/35 group-hover:text-white/60"
                            )}
                            style={isActive ? {
                              background: "linear-gradient(135deg, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.4) 100%)",
                              boxShadow: "0 0 10px rgba(139,92,246,0.4)"
                            } : {
                              background: "rgba(255,255,255,0.05)"
                            }}
                          >
                            <item.icon size={14} />
                          </div>
                          <span className="truncate">{item.name}</span>
                          {isActive && (
                            <div
                              className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)" }}
                            />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer — user info + logout */}
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white/70 truncate">{user?.fullName ?? "Admin"}</div>
              <div className="text-[10px] text-white/25 truncate">{user?.username ?? ""}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/25 hover:text-red-400 transition-colors duration-200 shrink-0 p-1 rounded-lg hover:bg-red-500/10"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
