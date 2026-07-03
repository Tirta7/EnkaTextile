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
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )} 
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    </DrawerTrigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = React.forwardRef(({ className, children, ...props }: any, ref: any) => {
  return (
    <DrawerContent className="max-h-[85vh] px-4 pb-8" ref={ref} {...props}>
      <div className="sr-only"><DrawerTitle>Select Option</DrawerTitle></div>
      <div className="overflow-y-auto max-h-[calc(85vh-3rem)] w-full py-2 flex flex-col gap-1">
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
        "relative flex w-full cursor-pointer select-none items-center justify-center rounded-xl py-3.5 text-lg font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        isSelected ? "bg-primary/10 text-primary font-semibold" : "",
        disabled ? "pointer-events-none opacity-50" : "",
        className
      )}
      onClick={() => {
        if (disabled) return;
        if (onValueChange) onValueChange(value);
        setOpen(false); // iOS style auto close
      }}
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
