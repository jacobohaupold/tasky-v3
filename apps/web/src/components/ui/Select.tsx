import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

// ── Base Select (single) ─────────────────────────────────────────────────────
export const SelectRoot = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  placeholder,
  ...props
}: SelectPrimitive.SelectTriggerProps & { placeholder?: string }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2",
        "rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3",
        "text-sm text-text placeholder:text-muted",
        "transition-all duration-[var(--duration-fast)]",
        "hover:border-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "data-[placeholder]:text-muted",
        className
      )}
      {...props}
    >
      {children ?? <SelectPrimitive.Value placeholder={placeholder} />}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 stroke-[1.5] text-muted flex-shrink-0 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "relative z-50 max-h-72 min-w-[8rem] overflow-hidden",
          "rounded-[var(--radius-md)] border border-border bg-surface-1 shadow-[var(--shadow-lg)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-muted">
          <ChevronUp className="h-4 w-4 stroke-[1.5]" />
        </SelectPrimitive.ScrollUpButton>

        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>

        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-muted">
          <ChevronDown className="h-4 w-4 stroke-[1.5]" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2.5",
        "rounded-[var(--radius-xs)] py-1.5 pl-8 pr-2.5 text-sm text-text outline-none",
        "transition-colors focus:bg-surface-2 focus:text-text",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 stroke-[2]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({
  className,
  ...props
}: SelectPrimitive.SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn("px-2.5 py-1 text-2xs font-medium uppercase tracking-wider text-muted", className)}
      {...props}
    />
  );
}

export function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
}

// ── Convenience wrapper ───────────────────────────────────────────────────────
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function SimpleSelect({
  value,
  onValueChange,
  placeholder = "Selecciona...",
  options,
  label,
  error,
  disabled,
  className,
}: SimpleSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <SelectRoot value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-red-400", className)} placeholder={placeholder} />
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              <div className="flex items-center gap-2">
                {opt.icon && (
                  <span className="text-muted [&>svg]:stroke-[1.5] [&>svg]:h-4 [&>svg]:w-4">
                    {opt.icon}
                  </span>
                )}
                <div>
                  <div>{opt.label}</div>
                  {opt.description && (
                    <div className="text-xs text-muted">{opt.description}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
