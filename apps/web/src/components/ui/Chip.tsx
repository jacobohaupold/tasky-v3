import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ChipVariant = "default" | "active" | "success" | "warning" | "error" | "info" | "dot";
export type ChipSize = "sm" | "md";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: React.ReactNode;
  onRemove?: () => void;
  removable?: boolean;
  dot?: boolean;
  dotColor?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  default: "bg-surface-2 text-muted border border-border",
  active:  "bg-accent text-white border border-accent/20",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error:   "bg-red-50 text-red-600 border border-red-200",
  info:    "bg-blue-50 text-blue-700 border border-blue-200",
  dot:     "bg-surface-2 text-muted border border-border",
};

const sizeStyles: Record<ChipSize, string> = {
  sm: "h-5 px-2 text-2xs gap-1 rounded-[var(--radius-xs)]",
  md: "h-6 px-2.5 text-xs gap-1.5 rounded-[var(--radius-xs)]",
};

const dotColors: Record<ChipVariant, string> = {
  default: "bg-muted",
  active:  "bg-white",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error:   "bg-red-500",
  info:    "bg-blue-500",
  dot:     "bg-muted",
};

export function Chip({
  variant = "default",
  size = "md",
  icon,
  onRemove,
  removable,
  dot,
  dotColor,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center font-medium select-none whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full flex-shrink-0",
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
            dotColor ?? dotColors[variant]
          )}
        />
      )}
      {icon && !dot && (
        <span aria-hidden="true" className="flex-shrink-0 [&>svg]:stroke-[1.5]">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {(onRemove || removable) && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar"
          className={cn(
            "-mr-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity",
            "hover:bg-black/10"
          )}
        >
          <X className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={2} />
        </button>
      )}
    </span>
  );
}

/** Status-specific preset */
export function StatusChip({
  status,
  ...props
}: Omit<ChipProps, "variant"> & {
  status: "todo" | "progress" | "review" | "done" | "cancelled";
}) {
  const map: Record<string, ChipVariant> = {
    todo:      "default",
    progress:  "info",
    review:    "warning",
    done:      "success",
    cancelled: "error",
  };
  const labels: Record<string, string> = {
    todo:      "Pendiente",
    progress:  "En curso",
    review:    "Revisión",
    done:      "Completado",
    cancelled: "Cancelado",
  };
  return (
    <Chip variant={map[status]} dot {...props}>
      {labels[status]}
    </Chip>
  );
}
