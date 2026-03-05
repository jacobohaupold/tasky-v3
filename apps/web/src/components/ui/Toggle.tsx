import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  name?: string;
}

const sizeStyles = {
  sm: { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3.5" },
  md: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  id,
  name,
}: ToggleProps) {
  const styles = sizeStyles[size];
  const toggleId = id ?? name ?? (label?.toLowerCase().replace(/\s+/g, "-"));

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        "flex items-start gap-3 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Track */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          id={toggleId}
          name={name}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          aria-hidden="true"
          className={cn(
            "rounded-full transition-colors duration-[var(--duration-fast)]",
            styles.track,
            checked ? "bg-accent" : "bg-border group-hover:bg-muted/40",
            disabled && "pointer-events-none"
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full bg-white shadow-xs",
            "transition-transform duration-[var(--duration-fast)]",
            styles.thumb,
            checked && styles.translate
          )}
        />
      </div>

      {/* Label */}
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-medium text-text leading-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted leading-snug">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
