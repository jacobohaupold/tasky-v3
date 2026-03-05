import { Toaster, toast as hotToast, type ToastOptions } from "react-hot-toast";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";

// ── Toaster setup ─────────────────────────────────────────────────────────────
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{ top: 16, right: 16 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--color-surface-1)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          padding: "12px 14px",
          maxWidth: 380,
          fontSize: "0.875rem",
          fontFamily: "var(--font-body)",
        },
      }}
    />
  );
}

// ── Custom toast content ───────────────────────────────────────────────────────
interface ToastContentProps {
  message: string;
  variant: "success" | "error" | "info" | "warning";
  toastId: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    iconClass: "text-green-500",
    barClass: "bg-green-500",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    barClass: "bg-red-500",
  },
  info: {
    icon: Info,
    iconClass: "text-accent",
    barClass: "bg-accent",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    barClass: "bg-amber-500",
  },
};

function ToastContent({ message, variant, toastId }: ToastContentProps) {
  const { icon: Icon, iconClass, barClass } = variantConfig[variant];

  return (
    <div className="flex items-start gap-3 w-full">
      {/* Colored left bar */}
      <span className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-md)]", barClass)} />

      {/* Icon */}
      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5 stroke-[2]", iconClass)} />

      {/* Message */}
      <span className="flex-1 text-sm leading-snug">{message}</span>

      {/* Dismiss */}
      <button
        onClick={() => hotToast.dismiss(toastId)}
        className="flex-shrink-0 text-muted hover:text-text transition-colors mt-0.5"
        aria-label="Cerrar notificación"
      >
        <X className="h-3.5 w-3.5 stroke-[2]" />
      </button>
    </div>
  );
}

// ── Toast API ─────────────────────────────────────────────────────────────────
const shared: ToastOptions = {
  style: {
    background: "var(--color-surface-1)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-lg)",
    padding: "12px 14px 12px 20px", // extra left padding for bar
    maxWidth: 380,
    position: "relative",
    overflow: "hidden",
  },
};

export const toast = {
  success(message: string, opts?: ToastOptions) {
    return hotToast.custom(
      (t) => <ToastContent message={message} variant="success" toastId={t.id} />,
      { ...shared, ...opts }
    );
  },
  error(message: string, opts?: ToastOptions) {
    return hotToast.custom(
      (t) => <ToastContent message={message} variant="error" toastId={t.id} />,
      { duration: 6000, ...shared, ...opts }
    );
  },
  info(message: string, opts?: ToastOptions) {
    return hotToast.custom(
      (t) => <ToastContent message={message} variant="info" toastId={t.id} />,
      { ...shared, ...opts }
    );
  },
  warning(message: string, opts?: ToastOptions) {
    return hotToast.custom(
      (t) => <ToastContent message={message} variant="warning" toastId={t.id} />,
      { ...shared, ...opts }
    );
  },
  dismiss: hotToast.dismiss,
  loading: hotToast.loading,
  promise: hotToast.promise,
};
