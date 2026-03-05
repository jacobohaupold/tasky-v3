import { cn } from "@/lib/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-brand-200 border-t-brand-600",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        {spinner}
      </div>
    );
  }

  return spinner;
}
