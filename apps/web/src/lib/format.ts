export function money(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function moneyExact(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "USD" });
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function forDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

// Convierte un valor <input type="date"> a ISO datetime (o undefined).
export function dateInputToIso(v: string): string | undefined {
  return v ? new Date(v + "T00:00:00").toISOString() : undefined;
}

export function durationBetween(start: string, end: string | null): string {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function relativeDay(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.round((d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";
  if (diffDays < 0) return `Hace ${-diffDays}d`;
  return `En ${diffDays}d`;
}
