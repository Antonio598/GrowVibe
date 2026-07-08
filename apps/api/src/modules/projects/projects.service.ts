import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";
import { notifyMany } from "../../services/notification-dispatcher.service";

export function listProjects(groupId: string) {
  return prisma.project.findMany({ where: { groupId }, orderBy: { createdAt: "desc" } });
}

export function createProject(groupId: string, name: string, progress = 0) {
  return prisma.project.create({ data: { groupId, name, progress } });
}

export async function updateProject(
  projectId: string,
  data: { name?: string; progress?: number },
  actingUserId: string,
) {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) throw new NotFoundError("Proyecto no encontrado");

  const project = await prisma.project.update({ where: { id: projectId }, data });

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
