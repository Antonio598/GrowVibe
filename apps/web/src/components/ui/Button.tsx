import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "lime";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
  secondary: "bg-surface text-ink border border-line hover:border-primary/50 hover:bg-primary-soft/40",
  ghost: "text-muted hover:bg-primary-soft/50 hover:text-ink",
  danger: "bg-coral text-white hover:brightness-95 shadow-sm",
  lime: "bg-lime text-ink hover:bg-lime-dark shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({ variant = "primary", size = "md", icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  label: string;
}

export function IconButton({ variant = "ghost", label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "danger"
          ? "text-coral hover:bg-coral-soft"
          : variant === "primary"
            ? "text-primary hover:bg-primary-soft"
            : "text-muted hover:bg-primary-soft/60 hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
