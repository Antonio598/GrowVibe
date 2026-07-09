import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";

export function advance(date: Date, interval: string): Date {
  const d = new Date(date);
  if (interval === "daily") d.setDate(d.getDate() + 1);
  else if (interval === "weekly") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1); // monthly
  return d;
}

export function listRecurring(userId: string) {
  return prisma.recurringTransaction.findMany({ where: { userId }, orderBy: { nextRun: "asc" } });
}

export function createRecurring(
  userId: string,
  data: { type: string; amount: number; categoryId?: string | null; note?: string; interval: string; nextRun?: string },
) {
  return prisma.recurringTransaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId ?? null,
      note: data.note ?? null,
      interval: data.interval,
      nextRun: data.nextRun ? new Date(data.nextRun) : advance(new Date(), data.interval),
    },
  });
}

export async function updateRecurring(userId: string, id: string, data: Record<string, unknown>) {
  const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Recurrente no encontrada");
  return prisma.recurringTransaction.update({
    where: { id },
    data: {
      ...(data.type !== undefined ? { type: data.type as string } : {}),
      ...(data.amount !== undefined ? { amount: data.amount as number } : {}),
      ...(data.categoryId !== undefined ? { categoryId: (data.categoryId as string) ?? null } : {}),
      ...(data.note !== undefined ? { note: (data.note as string) ?? null } : {}),
      ...(data.interval !== undefined ? { interval: data.interval as string } : {}),
      ...(data.nextRun !== undefined ? { nextRun: new Date(data.nextRun as string) } : {}),
      ...(data.active !== undefined ? { active: data.active as boolean } : {}),
    },
  });
}

export async function deleteRecurring(userId: string, id: string) {
  const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Recurrente no encontrada");
  await prisma.recurringTransaction.delete({ where: { id } });
}

// Materializa las recurrentes vencidas: crea la Transaction real y avanza
// nextRun. Corre en el cron. Usa un while por si se saltaron varios periodos.
export async function materializeDueRecurring() {
  const now = new Date();
  const due = await prisma.recurringTransaction.findMany({ where: { active: true, nextRun: { lte: now } } });
  let created = 0;
  for (const r of due) {
    let next = r.nextRun;
    // Genera todas las ocurrencias vencidas (evita perder periodos), con tope.
    let guard = 0;
    while (next <= now && guard < 60) {
      await prisma.transaction.create({
        data: { userId: r.userId, type: r.type, amount: r.amount, categoryId: r.categoryId, note: r.note ?? "(recurrente)", date: next },
      });
      created++;
      next = advance(next, r.interval);
      guard++;
    }
    await prisma.recurringTransaction.update({ where: { id: r.id }, data: { nextRun: next } });
  }
  return created;
}
