import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

// Re-export root components
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

// ── Content ───────────────────────────────────────────────────────────────────
const contentClass = cn(
  "z-50 min-w-[10rem] overflow-hidden rounded-[var(--radius-md)] border border-border",
  "bg-surface-1 p-1.5 shadow-[var(--shadow-lg)]",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-2",
  "data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2",
  "data-[side=top]:slide-in-from-bottom-2",
  "max-h-80 overflow-y-auto"
);

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(contentClass, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

// ── Item ──────────────────────────────────────────────────────────────────────
const itemClass = cn(
  "relative flex cursor-pointer select-none items-center gap-2.5 rounded-[var(--radius-xs)]",
  "px-2.5 py-1.5 text-sm text-text outline-none transition-colors",
  "focus:bg-surface-2 focus:text-text",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
);

interface DropdownMenuItemProps extends DropdownMenuPrimitive.DropdownMenuItemProps {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export function DropdownMenuItem({
  className,
  icon,
  shortcut,
  destructive,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        itemClass,
        destructive && "text-red-500 focus:bg-red-50 focus:text-red-600",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 text-muted [&>svg]:stroke-[1.5] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-muted tracking-widest">{shortcut}</span>
      )}
    </DropdownMenuPrimitive.Item>
  );
}

// ── Check item ────────────────────────────────────────────────────────────────
export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuPrimitive.DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(itemClass, "pl-8", className)}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4 stroke-[2]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

// ── Radio item ────────────────────────────────────────────────────────────────
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(itemClass, "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

// ── Sub trigger ───────────────────────────────────────────────────────────────
export function DropdownMenuSubTrigger({
  className,
  children,
  icon,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubTriggerProps & { icon?: React.ReactNode }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(itemClass, "data-[state=open]:bg-surface-2", className)}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 text-muted [&>svg]:stroke-[1.5] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      <ChevronRight className="ml-auto h-4 w-4 stroke-[1.5] text-muted" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        className={cn(contentClass, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2.5 py-1 text-2xs font-medium uppercase tracking-wider text-muted", className)}
      {...props}
    />
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────
export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
}
