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

  useEffect(() => {
    const appName = settings?.["app_name"];
    if (appName) {
      document.title = appName;
    } else {
      document.title = "VOCpos";
    }

    const appLogo = settings?.["app_logo"];
    if (appLogo && appLogo !== "/favicon.svg") {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = appLogo;
    }
  }, [settings]);

  return (
    <div className="h-dvh w-full bg-background flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overscroll-none relative">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onThemeToggle={toggle}
        />
        <main className={`flex-1 p-4 md:p-6 lg:p-8 pb-[max(5rem,env(safe-area-inset-bottom))] md:pb-[max(1rem,env(safe-area-inset-bottom))] ${location === '/' ? '' : 'pt-[max(1.5rem,env(safe-area-inset-top))]'}`}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
