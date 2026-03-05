import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { scaleIn, slideInRight, backdrop } from "@/lib/animations";

export type ModalVariant = "modal" | "sheet";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: ModalVariant;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  hideClose?: boolean;
}

const sizeClasses = {
  sm:   "max-w-sm",
  md:   "max-w-lg",
  lg:   "max-w-2xl",
  xl:   "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
  className,
  hideClose = false,
}: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Focus close button when opened
  useEffect(() => {
    if (open) setTimeout(() => closeRef.current?.focus(), 50);
  }, [open]);

  const isSheet = variant === "sheet";

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-desc" : undefined}
        >
          {/* Backdrop */}
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          {isSheet ? (
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "relative ml-auto flex h-full w-full max-w-md flex-col bg-surface-1 shadow-xl",
                className
              )}
            >
              <ModalInner
                title={title}
                description={description}
                footer={footer}
                onClose={onClose}
                hideClose={hideClose}
                closeRef={closeRef}
              >
                {children}
              </ModalInner>
            </motion.div>
          ) : (
            <div className="relative flex w-full items-center justify-center p-4">
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "relative w-full rounded-[var(--radius-lg)] bg-surface-1 shadow-xl",
                  sizeClasses[size],
                  className
                )}
              >
                <ModalInner
                  title={title}
                  description={description}
                  footer={footer}
                  onClose={onClose}
                  hideClose={hideClose}
                  closeRef={closeRef}
                >
                  {children}
                </ModalInner>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

function ModalInner({
  title,
  description,
  children,
  footer,
  onClose,
  hideClose,
  closeRef,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  hideClose: boolean;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <>
      {/* Header */}
      {(title || !hideClose) && (
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-text font-[var(--font-heading)]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          {!hideClose && (
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={cn(
                "ml-4 flex-shrink-0 rounded-[var(--radius-sm)] p-1.5",
                "text-muted hover:text-text hover:bg-surface-2",
                "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              )}
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          {footer}
        </div>
      )}
    </>
  );
}
