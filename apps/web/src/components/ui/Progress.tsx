import { cn } from "./cn";

// Barra con degradado verde→lima (motivo "crecimiento").
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line/70", className)}>
      <div
        className="h-full origin-left rounded-full bg-gradient-to-r from-primary to-lime transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// Anillo de progreso para KPIs/objetivos.
export function ProgressRing({ value, size = 56, stroke = 6, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EAE7DF" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#15A06B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-ink tabular">{label ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}
