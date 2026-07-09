import type { ReactNode } from "react";
import { cn } from "./cn";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const palette = ["#15A06B", "#F0653E", "#8FBD2E", "#E8A93B", "#0C6B47"];

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}

export function Tabs<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string; icon?: ReactNode }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 scrollbar-thin">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
            active === t.id ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-primary-soft/50 hover:text-ink",
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
