import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface shadow-card", className)} {...props} />
  );
}

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "primary" | "coral" | "lime" | "gold";
  to?: string;
  onClick?: () => void;
}

const accentBg: Record<NonNullable<StatTileProps["accent"]>, string> = {
  primary: "bg-primary-soft text-primary-dark",
  coral: "bg-coral-soft text-coral",
  lime: "bg-lime/20 text-lime-dark",
  gold: "bg-gold/15 text-gold",
};

export function StatTile({ label, value, hint, icon, accent = "primary", onClick }: StatTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition-all",
        onClick && "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        {icon && <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accentBg[accent])}>{icon}</span>}
      </div>
      <div className="tabular text-3xl font-semibold text-ink font-display">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </button>
  );
}
