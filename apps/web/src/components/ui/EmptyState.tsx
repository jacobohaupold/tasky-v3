import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { container: "py-8", icon: "h-10 w-10", title: "text-base", desc: "text-sm" },
  md: { container: "py-12", icon: "h-14 w-14", title: "text-lg", desc: "text-sm" },
  lg: { container: "py-16", icon: "h-20 w-20", title: "text-xl", desc: "text-base" },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.container,
        className
      )}
      role="status"
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex items-center justify-center rounded-2xl bg-surface-2",
            styles.icon,
            "[&>svg]:stroke-[1.5] [&>svg]:text-muted",
            "[&>svg]:h-6 [&>svg]:w-6"
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3
        className={cn(
          "font-semibold text-text font-[var(--font-heading)]",
          styles.title
        )}
      >
        {title}
      </h3>

      {description && (
        <p className={cn("mt-1.5 text-muted max-w-sm", styles.desc)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
