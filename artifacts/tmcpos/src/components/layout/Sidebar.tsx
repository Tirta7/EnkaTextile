import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Truck,
  ShoppingCart,
  ShoppingCart as ShoppingBag,
  ArrowLeftRight,
  Wallet,
  Receipt,
  BookOpen,
  LineChart,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "Master Data",
    items: [
      { name: "Kategori", href: "/kategori", icon: Tags },
      { name: "Barang", href: "/barang", icon: Package },
      { name: "Pelanggan", href: "/pelanggan", icon: Users },
      { name: "Supplier", href: "/supplier", icon: Truck },
    ]
  },
  {
    title: "Transaksi",
    items: [
      { name: "Penjualan", href: "/penjualan", icon: ShoppingCart },
      { name: "Pembelian", href: "/pembelian", icon: ShoppingBag },
      { name: "Mutasi Stok", href: "/mutasi", icon: ArrowLeftRight },
    ]
  },
  {
    title: "Keuangan",
    items: [
      { name: "Piutang", href: "/piutang", icon: Wallet },
      { name: "Hutang", href: "/hutang", icon: Receipt },
      { name: "Buku Kas", href: "/buku-kas", icon: BookOpen },
    ]
  },
  {
    title: "Laporan",
    items: [
      { name: "Laporan", href: "/laporan", icon: LineChart },
    ]
  }
];

export function Sidebar({ isOpen, setOpen }: { isOpen: boolean; setOpen: (open: boolean) => void }) {
  const [location] = useLocation();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary/10">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-sidebar-primary-foreground">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center text-white">
              <Package size={18} />
            </div>
            VOCpos
          </div>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setOpen(false)}>
            <X size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-4 space-y-6">
            {navigation.map((group) => (
              <div key={group.title}>
                <h4 className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link key={item.name} href={item.href}>
                        <div className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}>
                          <item.icon size={18} />
                          {item.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/40 text-center">
          &copy; {new Date().getFullYear()} Enka Textile
        </div>
      </div>
    </>
  );
}
