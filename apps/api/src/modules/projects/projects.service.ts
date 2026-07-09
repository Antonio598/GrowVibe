import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";
import { notifyMany } from "../../services/notification-dispatcher.service";

export function listProjects(groupId: string) {
  return prisma.project.findMany({ where: { groupId }, orderBy: { createdAt: "desc" } });
}

export function getProject(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId } });
}

export function createProject(
  groupId: string,
  data: {
    name: string;
    description?: string;
    type?: string;
    progress?: number;
    startDate?: string;
    dueDate?: string;
  },
) {
  return prisma.project.create({
    data: {
      groupId,
      name: data.name,
      description: data.description ?? null,
      type: data.type ?? "ongoing",
      progress: data.progress ?? 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
    type?: string;
    progress?: number;
    startDate?: string | null;
    dueDate?: string | null;
  },
  actingUserId: string,
) {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) throw new NotFoundError("Proyecto no encontrado");

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.progress !== undefined ? { progress: data.progress } : {}),
      ...(data.startDate !== undefined
        ? { startDate: data.startDate ? new Date(data.startDate) : null }
        : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
    },
  });

  if (data.progress !== undefined && data.progress !== existing.progress) {
    const members = await prisma.groupMember.findMany({ where: { groupId: existing.groupId } });
    const recipientIds = members.map((m) => m.userId).filter((id) => id !== actingUserId);
    void notifyMany(recipientIds, {
      type: "project_update",
      message: `El proyecto "${project.name}" avanzó a ${data.progress}%`,
      metadata: { projectId: project.id, progress: data.progress },
    });
  }

  return project;
}

export async function deleteProject(projectId: string) {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) throw new NotFoundError("Proyecto no encontrado");
  await prisma.project.delete({ where: { id: projectId } });
}
