import { cn } from "@/lib/cn";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-sunken flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 11.5L11 13.5L15 9.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="4"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold text-brand-600 tracking-tight">
          Tasky
        </span>
      </div>

      {/* Card */}
      <div
        className={cn(
          "w-full max-w-md rounded-2xl bg-surface-base border border-gray-200/60 shadow-xl p-8",
          className
        )}
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Shared form primitives ──────────────────────────────────────────────────

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function InputField({
  label,
  error,
  icon,
  rightElement,
  className,
  id,
  ...props
}: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            icon ? "pl-10" : "",
            rightElement ? "pr-10" : "",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline";
  icon?: React.ReactNode;
}

export function AuthButton({
  children,
  loading,
  variant = "primary",
  icon,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
        "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

export function Divider({ label = "o" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
