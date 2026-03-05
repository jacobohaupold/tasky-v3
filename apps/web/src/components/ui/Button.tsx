import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm " +
    "focus-visible:ring-2 focus-visible:ring-accent/50",
  secondary:
    "bg-surface-2 text-text border border-border hover:bg-border/60 active:scale-[0.98] " +
    "focus-visible:ring-2 focus-visible:ring-accent/30",
  ghost:
    "bg-transparent text-muted hover:bg-surface-2 hover:text-text active:scale-[0.98] " +
    "focus-visible:ring-2 focus-visible:ring-accent/30",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-sm " +
    "focus-visible:ring-2 focus-visible:ring-red-400/50",
  icon:
    "bg-transparent text-muted hover:bg-surface-2 hover:text-text active:scale-[0.95] " +
    "focus-visible:ring-2 focus-visible:ring-accent/30 aspect-square",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)] gap-1.5",
  md: "h-10 px-4 text-sm rounded-[var(--radius-md)] gap-2",
  lg: "h-11 px-5 text-base rounded-[var(--radius-md)] gap-2.5",
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 w-8 rounded-[var(--radius-sm)]",
  md: "h-10 w-10 rounded-[var(--radius-md)]",
  lg: "h-11 w-11 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) {
    const isIcon = variant === "icon";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-[var(--duration-fast)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "select-none outline-none",
          variantStyles[variant],
          isIcon ? iconSizeStyles[size] : sizeStyles[size],
          fullWidth && !isIcon && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent flex-shrink-0"
              aria-hidden="true"
            />
            {!isIcon && children && (
              <span className="opacity-80">{children}</span>
            )}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="flex-shrink-0 [&>svg]:stroke-[1.5]" aria-hidden="true">
                {icon}
              </span>
            )}
            {!isIcon && children}
            {icon && iconPosition === "right" && (
              <span className="flex-shrink-0 [&>svg]:stroke-[1.5]" aria-hidden="true">
                {icon}
              </span>
            )}
            {isIcon && icon && (
              <span className="[&>svg]:stroke-[1.5]" aria-hidden="true">
                {icon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);
