import type { ReactNode } from "react";
import { cn } from "./cn";
import type { TaskPriority, TaskStatus } from "shared";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "primary" | "lime" | "coral" | "gold"; className?: string }) {
  const tones = {
    neutral: "bg-line/60 text-muted",
    primary: "bg-primary-soft text-primary-dark",
    lime: "bg-lime/25 text-lime-dark",
    coral: "bg-coral-soft text-coral",
    gold: "bg-gold/15 text-gold",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

const priorityMap: Record<TaskPriority, { label: string; tone: "coral" | "gold" | "neutral" }> = {
  high: { label: "Alta", tone: "coral" },
  medium: { label: "Media", tone: "gold" },
  low: { label: "Baja", tone: "neutral" },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const p = priorityMap[priority];
  return <Badge tone={p.tone}>{p.label}</Badge>;
}

const statusMap: Record<TaskStatus, { label: string; tone: "neutral" | "gold" | "primary" }> = {
  pending: { label: "Pendiente", tone: "neutral" },
  in_progress: { label: "En progreso", tone: "gold" },
  done: { label: "Hecho", tone: "primary" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const s = statusMap[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
