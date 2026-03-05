import { cn } from "@/lib/cn";

type SkeletonVariant = "text" | "circle" | "rect" | "card";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClass = "skeleton rounded";

  if (variant === "text") {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClass, "h-4 rounded-[var(--radius-xs)]", className)}
            style={{
              width:
                width ??
                (i === lines - 1 && lines > 1 ? "60%" : "100%"),
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    const size = width ?? height ?? 40;
    return (
      <div
        className={cn(baseClass, "rounded-full flex-shrink-0", className)}
        style={{ width: size, height: size, ...style }}
        aria-hidden="true"
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-[var(--radius-md)] border border-border p-5 space-y-3",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" width={40} />
          <div className="flex-1">
            <Skeleton variant="text" lines={2} />
          </div>
        </div>
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="rect" height={32} className="rounded-[var(--radius-sm)]" />
      </div>
    );
  }

  return (
    <div
      className={cn(baseClass, "rounded-[var(--radius-sm)]", className)}
      aria-hidden="true"
      style={{ width: width ?? "100%", height: height ?? 16, ...style }}
      {...props}
    />
  );
}
