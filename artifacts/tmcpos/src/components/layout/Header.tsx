import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { isConnected } = useWebSocket();

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
        
        <div className="font-semibold text-lg hidden sm:block">
          Enka Textile
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"
          )} />
          <span className={isConnected ? "text-foreground" : "text-muted-foreground"}>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
