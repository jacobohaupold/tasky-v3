import { forwardRef, useState } from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  floatingLabel?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      icon,
      rightElement,
      floatingLabel = false,
      className,
      id,
      type = "text",
      onClear,
      value,
      ...props
    },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const resolvedType = type === "password" && showPassword ? "text" : type;
    const isSearch = type === "search";
    const isPassword = type === "password";

    const hasValue = value !== undefined ? String(value).length > 0 : false;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-muted uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left icon */}
          {(icon || isSearch) && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
              {isSearch && !icon ? (
                <Search className="h-4 w-4 stroke-[1.5]" />
              ) : (
                icon
              )}
            </div>
          )}

          {/* Floating label */}
          {floatingLabel && label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-3 text-muted pointer-events-none transition-all duration-[var(--duration-fast)]",
                hasValue || props.placeholder
                  ? "-top-2 text-2xs bg-surface-1 px-1 font-medium text-accent"
                  : "top-1/2 -translate-y-1/2 text-sm"
              )}
            >
              {label}
            </label>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            value={value}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              "w-full h-10 rounded-[var(--radius-sm)] border bg-surface-1 text-sm text-text",
              "px-3 placeholder:text-muted/60",
              "transition-all duration-[var(--duration-fast)]",
              "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
                : "border-border hover:border-muted/50",
              (icon || isSearch) ? "pl-9" : "",
              (rightElement || isPassword || (isSearch && hasValue)) ? "pr-10" : "",
              className
            )}
            {...props}
          />

          {/* Right element */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
            {isSearch && hasValue && onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Limpiar búsqueda"
                className="text-muted hover:text-text transition-colors"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="text-muted hover:text-text transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 stroke-[1.5]" />
                ) : (
                  <Eye className="h-4 w-4 stroke-[1.5]" />
                )}
              </button>
            )}
            {rightElement && !isPassword && rightElement}
          </div>
        </div>

        {/* Error or hint */}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

// ── Textarea ──────────────────────────────────────────────────────────────────
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-muted uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={cn(
            "w-full min-h-[80px] rounded-[var(--radius-sm)] border bg-surface-1 text-sm text-text",
            "px-3 py-2.5 placeholder:text-muted/60 resize-y",
            "transition-all duration-[var(--duration-fast)]",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
              : "border-border hover:border-muted/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);
