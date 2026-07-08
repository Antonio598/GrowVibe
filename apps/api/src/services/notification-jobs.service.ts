import { prisma } from "../config/database";
import { notify } from "./notification-dispatcher.service";

const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;
const FITNESS_REMINDER_WINDOW_MS = 48 * 60 * 60 * 1000;

async function checkTaskDueSoon() {
  const now = new Date();
  const soon = new Date(now.getTime() + DUE_SOON_WINDOW_MS);

  const tasks = await prisma.task.findMany({
    where: { status: { not: "done" }, dueDate: { gte: now, lte: soon } },
  });

  let count = 0;
  for (const task of tasks) {
    await notify({
      userId: task.userId,
      type: "task_due",
      message: `La tarea "${task.title}" vence pronto`,
      metadata: { taskId: task.id, dueDate: task.dueDate?.toISOString() },
    });
    count++;
  }
  return count;
}

async function checkTaskOverdue() {
  const now = new Date();

  const tasks = await prisma.task.findMany({
    where: { status: { not: "done" }, dueDate: { lt: now } },
  });

  let count = 0;
  for (const task of tasks) {
    await notify({
      userId: task.userId,
      type: "task_overdue",
      message: `La tarea "${task.title}" está atrasada`,
      metadata: { taskId: task.id, dueDate: task.dueDate?.toISOString() },
    });
    count++;
  }
  return count;
}

// Placeholder simple: si un usuario no tiene ningún fitness_log reciente,
// se le recuerda registrar su rutina/dieta. No hay lógica de rutina esperada
// vs. cumplida en el esqueleto.
async function checkFitnessReminders() {
  const cutoff = new Date(Date.now() - FITNESS_REMINDER_WINDOW_MS);

  const users = await prisma.profile.findMany({
    where: { fitnessLogs: { none: { date: { gte: cutoff } } } },
  });

  let count = 0;
  for (const user of users) {
    await notify({
      userId: user.id,
      type: "routine_reminder",
      message: "No has registrado tu rutina/dieta en las últimas 48h",
    });
    count++;
  }
  return count;
}

export async function runNotificationChecks() {
  const [dueSoon, overdue, fitnessReminders] = await Promise.all([
    checkTaskDueSoon(),
    checkTaskOverdue(),
    checkFitnessReminders(),
  ]);

  return { dueSoon, overdue, fitnessReminders };
}
