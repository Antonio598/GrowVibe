import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";

export function listDeliverables(projectId: string) {
  return prisma.deliverable.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
}

export function createDeliverable(
  projectId: string,
  createdBy: string,
  data: { title: string; description?: string; dueDate?: string },
) {
  return prisma.deliverable.create({
    data: {
      projectId,
      createdBy,
      title: data.title,
      description: data.description ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

export async function updateDeliverable(
  projectId: string,
  id: string,
  data: { title?: string; description?: string | null; status?: string; dueDate?: string | null },
) {
  const existing = await prisma.deliverable.findFirst({ where: { id, projectId } });
  if (!existing) throw new NotFoundError("Entrega no encontrada");

  // Marcar entregado/pendiente ajusta deliveredAt automáticamente.
  const deliveredAt =
    data.status === "delivered"
      ? existing.deliveredAt ?? new Date()
      : data.status === "pending"
        ? null
        : existing.deliveredAt;

  return prisma.deliverable.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.status !== undefined ? { status: data.status, deliveredAt } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
    },
  });
}

export async function deleteDeliverable(projectId: string, id: string) {
  const existing = await prisma.deliverable.findFirst({ where: { id, projectId } });
  if (!existing) throw new NotFoundError("Entrega no encontrada");
  await prisma.deliverable.delete({ where: { id } });
}
