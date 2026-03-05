import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
  className?: string;
  asChild?: boolean;
}

export function Tooltip({
  children,
  content,
  shortcut,
  side = "top",
  delayDuration = 300,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 max-w-[200px] rounded-[var(--radius-xs)] px-2.5 py-1.5",
            "bg-gray-900 text-xs text-white shadow-[var(--shadow-md)]",
            "animate-in fade-in-0 zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-1",
            "data-[side=left]:slide-in-from-right-1",
            "data-[side=right]:slide-in-from-left-1",
            "data-[side=top]:slide-in-from-bottom-1",
            "flex items-center gap-2",
            className
          )}
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-2xs font-mono leading-none">
              {shortcut}
            </kbd>
          )}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

// Convenience wrapper that sets up the Provider
export function TooltipRoot({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
}
