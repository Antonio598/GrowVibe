import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { notify } from "../../services/notification-dispatcher.service";

export function listCategories(userId: string) {
  return prisma.category.findMany({ where: { userId } });
}

export function createCategory(userId: string, name: string, type: string) {
  return prisma.category.create({ data: { userId, name, type } });
}

export interface TransactionFilters {
  type?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}

export function listTransactions(userId: string, filters: TransactionFilters) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.from || filters.to
        ? {
            date: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(
  userId: string,
  data: { type: string; amount: number; categoryId?: string; date: string; note?: string },
) {
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId ?? null,
      date: new Date(data.date),
      note: data.note ?? null,
    },
  });

  if (data.type === "expense" && data.amount > env.highExpenseThreshold) {
    void notify({
      userId,
      type: "expense_high",
      message: `Registraste un gasto alto de $${data.amount.toFixed(2)}`,
      metadata: { transactionId: transaction.id, amount: data.amount },
    });
  }

  return transaction;
}

export async function getSummary(userId: string, from?: string, to?: string) {
  const periodStart = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const periodEnd = to ? new Date(to) : new Date();

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: periodStart, lte: periodEnd } },
    include: { category: true },
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const byCategoryMap = new Map<string, { categoryId: string | null; categoryName: string; total: number }>();
  for (const t of transactions) {
    const key = t.categoryId ?? "sin_categoria";
    const entry = byCategoryMap.get(key) ?? {
      categoryId: t.categoryId,
      categoryName: t.category?.name ?? "Sin categoría",
      total: 0,
    };
    entry.total += t.amount;
    byCategoryMap.set(key, entry);
  }

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory: Array.from(byCategoryMap.values()),
  };
}
