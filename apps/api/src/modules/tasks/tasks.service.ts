import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";

export interface TaskFilters {
  status?: string;
  priority?: string;
  projectId?: string;
}

// Todo query queda scoped por userId — nunca se confía en un userId del cliente.
export function listTasks(userId: string, filters: TaskFilters) {
  return prisma.task.findMany({
    where: {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function createTask(userId: string, data: Record<string, unknown>) {
  return prisma.task.create({
    data: {
      userId,
      title: data.title as string,
      description: (data.description as string) ?? null,
      status: (data.status as string) ?? "pending",
      priority: (data.priority as string) ?? "medium",
      dueDate: data.dueDate ? new Date(data.dueDate as string) : null,
      projectId: (data.projectId as string) ?? null,
    },
  });
}

export async function updateTask(userId: string, taskId: string, data: Record<string, unknown>) {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) throw new NotFoundError("Tarea no encontrada");

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined ? { title: data.title as string } : {}),
      ...(data.description !== undefined ? { description: data.description as string } : {}),
      ...(data.status !== undefined ? { status: data.status as string } : {}),
      ...(data.priority !== undefined ? { priority: data.priority as string } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate as string) : null } : {}),
      ...(data.projectId !== undefined ? { projectId: data.projectId as string } : {}),
    },
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) throw new NotFoundError("Tarea no encontrada");
  await prisma.task.delete({ where: { id: taskId } });
}
