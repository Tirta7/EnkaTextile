import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function Header({ onMenuClick, theme, onThemeToggle }: HeaderProps) {
  const { isConnected } = useWebSocket();

  return (
    <header
      className="h-[64px] border-b flex items-center justify-between sticky top-0 z-30 px-5"
      style={{
        borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "hsl(var(--border))",
        background: theme === "dark"
          ? "rgba(10,10,20,0.85)"
          : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground w-9 h-9 rounded-xl"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </Button>

        <div className="flex items-center gap-2.5 hidden sm:flex">
          <div className="font-semibold text-sm text-foreground/70 tracking-wide">
            Enka Textile
          </div>
          <div className="w-1 h-1 rounded-full bg-foreground/20" />
          <div className="text-xs text-muted-foreground font-medium">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Live indicator */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
            isConnected
              ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/8 text-red-500"
          )}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-red-500"
          )} />
          <span className="hidden sm:inline">{isConnected ? "Live" : "Offline"}</span>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        >
          {theme === "dark"
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} />}
        </Button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm"
          style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
        >
          A
        </div>
      </div>
    </header>
  );
}
