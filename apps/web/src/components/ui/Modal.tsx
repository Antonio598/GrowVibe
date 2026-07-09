import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-pop animate-fade-in sm:rounded-2xl",
          size === "sm" ? "sm:max-w-sm" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-muted hover:bg-primary-soft/60">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Borrar",
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  );
}
