import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";

// Gasto del mes en curso, agrupado por categoría (null = sin categoría).
async function monthlySpentByCategory(userId: string) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const txns = await prisma.transaction.findMany({
    where: { userId, type: "expense", date: { gte: start, lte: end } },
  });
  const map = new Map<string, number>();
  let total = 0;
  for (const t of txns) {
    total += t.amount;
    const key = t.categoryId ?? "__none__";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return { map, total };
}

export async function listBudgets(userId: string) {
  const [budgets, spent] = await Promise.all([
    prisma.budget.findMany({ where: { userId }, include: { category: { select: { name: true } } } }),
    monthlySpentByCategory(userId),
  ]);
  return budgets.map((b) => ({
    id: b.id,
    userId: b.userId,
    categoryId: b.categoryId,
    categoryName: b.category?.name ?? null,
    amount: b.amount,
    // Presupuesto general (sin categoría) = gasto total del mes.
    spent: b.categoryId ? spent.map.get(b.categoryId) ?? 0 : spent.total,
    createdAt: b.createdAt.toISOString(),
  }));
}

export function createBudget(userId: string, data: { categoryId?: string | null; amount: number }) {
  return prisma.budget.create({ data: { userId, categoryId: data.categoryId ?? null, amount: data.amount } });
}

export async function updateBudget(userId: string, id: string, data: { categoryId?: string | null; amount?: number }) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Presupuesto no encontrado");
  return prisma.budget.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
    },
  });
}

export async function deleteBudget(userId: string, id: string) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Presupuesto no encontrado");
  await prisma.budget.delete({ where: { id } });
}
