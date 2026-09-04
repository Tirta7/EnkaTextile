import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggle } = useTheme();
  const { data: settings } = useSettings();


  return (
    <div className="h-[100dvh] w-full bg-background flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onThemeToggle={toggle}
        />
        <main className={`flex-1 overflow-y-auto overscroll-none p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-4 md:pt-4 lg:p-5 lg:pt-5 pb-[max(1rem,env(safe-area-inset-bottom))]`}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
