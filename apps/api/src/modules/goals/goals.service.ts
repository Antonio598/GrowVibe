import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";
import { notify } from "../../services/notification-dispatcher.service";

export function listGoals(userId: string) {
  return prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export function createGoal(
  userId: string,
  data: { name: string; targetAmount: number; currentAmount?: number; dueDate?: string },
) {
  return prisma.savingsGoal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

export async function updateGoal(
  userId: string,
  id: string,
  data: { name?: string; targetAmount?: number; dueDate?: string | null },
) {
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Meta no encontrada");
  return prisma.savingsGoal.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.targetAmount !== undefined ? { targetAmount: data.targetAmount } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
    },
  });
}

// Aporta (o retira, con monto negativo) a una meta. Al alcanzar el objetivo
// por primera vez dispara goal_reached (marcado con reachedAt para no repetir).
export async function contribute(userId: string, id: string, amount: number) {
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Meta no encontrada");

  const current = Math.max(0, existing.currentAmount + amount);
  const justReached = !existing.reachedAt && current >= existing.targetAmount;

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: current, ...(justReached ? { reachedAt: new Date() } : {}) },
  });

  if (justReached) {
    void notify({
      userId,
      type: "goal_reached",
      message: `¡Alcanzaste tu meta de ahorro "${goal.name}"! 🎉`,
      metadata: { goalId: goal.id, targetAmount: goal.targetAmount },
    });
  }

  return goal;
}

export async function deleteGoal(userId: string, id: string) {
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Meta no encontrada");
  await prisma.savingsGoal.delete({ where: { id } });
}
