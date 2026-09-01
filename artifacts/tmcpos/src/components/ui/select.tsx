import * as React from "react"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

type SelectContextType = {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerItem: (value: string, label: React.ReactNode) => void;
  items: Record<string, React.ReactNode>;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("Must be inside Select");
  return context;
}

export function Select({ children, value, onValueChange, disabled, defaultValue }: any) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Record<string, React.ReactNode>>({});
  
  const registerItem = React.useCallback((val: string, label: React.ReactNode) => {
    setItems(prev => {
      // Prevent unnecessary renders if the item is already registered
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  }, []);

  const currentValue = value !== undefined ? value : defaultValue;

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange, open, setOpen, registerItem, items, disabled }}>
      <Drawer open={open} onOpenChange={setOpen}>
        {children}
      </Drawer>
    </SelectContext.Provider>
  )
}

export const SelectGroup = ({ className, ...props }: any) => (
  <div className={cn("py-2", className)} {...props} />
)

export const SelectValue = ({ placeholder }: any) => {
  const { value, items } = useSelect();
  return <span>{value && items[value] ? items[value] : placeholder}</span>
}

export const SelectTrigger = React.forwardRef(({ className, children, ...props }: any, ref: any) => {
  const { disabled } = useSelect();
  return (
    <DrawerTrigger asChild>
      <button 
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 [&>span]:truncate",
          className
        )} 
        {...props}
      >
        <span className="truncate flex-1 text-left">{children}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </button>
    </DrawerTrigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = React.forwardRef(({ className, children, ...props }: any, ref: any) => {
  const { open } = useSelect();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    let timeout: ReturnType<typeof setTimeout>;
    let searchString = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      // We only care about single characters
      if (e.key.length === 1) {
        searchString += e.key.toLowerCase();
        
        if (containerRef.current) {
          const elements = containerRef.current.querySelectorAll('[data-select-item]');
          const target = Array.from(elements).find(el => 
            el.textContent?.trim().toLowerCase().startsWith(searchString)
          );
          
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }

        // Reset the search string after a small delay
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          searchString = "";
        }, 500);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [open]);

  return (
    <DrawerContent className={cn("max-h-[85vh] px-4 pb-8", className)} ref={ref} {...props}>
      <div className="sr-only"><DrawerTitle>Select Option</DrawerTitle></div>
      <div 
        ref={containerRef}
        className="overflow-y-auto max-h-[calc(85vh-3rem)] w-full py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
      >
        {children}
      </div>
    </DrawerContent>
  )
})
SelectContent.displayName = "SelectContent"

export const SelectLabel = ({ className, ...props }: any) => (
  <div className={cn("px-2 py-3 text-sm font-semibold text-muted-foreground text-center", className)} {...props} />
)

export const SelectItem = React.forwardRef(({ className, children, value, disabled, ...props }: any, ref: any) => {
  const { value: selectedValue, onValueChange, setOpen, registerItem } = useSelect();
  
  React.useEffect(() => {
    registerItem(value, children);
  }, [value, children, registerItem]);

  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-center rounded-xl px-3 py-3 text-sm font-semibold text-center border border-transparent outline-none transition-all hover:bg-accent hover:border-border hover:shadow-sm active:scale-[0.98]",
        isSelected ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : "bg-slate-50 dark:bg-slate-900",
        disabled ? "pointer-events-none opacity-50" : "",
        className
      )}
      onClick={() => {
        if (disabled) return;
        if (onValueChange) onValueChange(value);
        setOpen(false); // iOS style auto close
      }}
      data-select-item="true"
      {...props}
    >
      {children}
      {isSelected && (
        <Check className="absolute right-4 h-5 w-5 text-primary" />
      )}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export const SelectSeparator = ({ className, ...props }: any) => (
  <div className={cn("-mx-1 my-2 h-px bg-muted", className)} {...props} />
)
