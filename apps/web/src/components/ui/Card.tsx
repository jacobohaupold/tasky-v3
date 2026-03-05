import { cn } from "@/lib/cn";

export type CardVariant = "default" | "tinted" | "interactive";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg" | "none";
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-surface-1 border border-border shadow-[var(--shadow-sm)]",
  tinted:
    "bg-surface-2 border border-border shadow-[var(--shadow-sm)]",
  interactive:
    "bg-surface-1 border border-border shadow-[var(--shadow-sm)] cursor-pointer " +
    "hover:shadow-[var(--shadow-md)] hover:border-muted/30 hover:-translate-y-0.5 " +
    "active:translate-y-0 active:shadow-[var(--shadow-sm)]",
};

const paddingStyles = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] transition-all duration-[var(--duration-base)]",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between pb-4 mb-4 border-b border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-2 pt-4 mt-4 border-t border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold text-text text-base font-[var(--font-heading)]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}
