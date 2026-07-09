import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

const base =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 " +
  "transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink", className)}>{children}</label>;
}

export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-[80px] resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}
