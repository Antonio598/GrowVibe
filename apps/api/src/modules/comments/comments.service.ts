import { prisma } from "../../config/database";
import { ForbiddenError, NotFoundError } from "../../utils/errors";
import { notifyMany } from "../../services/notification-dispatcher.service";

const commentInclude = { user: { select: { name: true } } } as const;

function toDto(c: Record<string, unknown> & { user?: { name: string } }) {
  const { user, ...rest } = c;
  return { ...rest, userName: user?.name };
}

export async function listComments(projectId: string) {
  const comments = await prisma.projectComment.findMany({
    where: { projectId },
    include: commentInclude,
    orderBy: { createdAt: "desc" },
  });
  return comments.map(toDto);
}

export async function createComment(projectId: string, userId: string, body: string) {
  const comment = await prisma.projectComment.create({
    data: { projectId, userId, body },
    include: commentInclude,
  });

  // Notificar a los demás miembros del grupo del proyecto.
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project) {
    const members = await prisma.groupMember.findMany({ where: { groupId: project.groupId } });
    const recipientIds = members.map((m) => m.userId).filter((id) => id !== userId);
    void notifyMany(recipientIds, {
      type: "comment_added",
      message: `${comment.user.name} comentó en "${project.name}"`,
      metadata: { projectId, commentId: comment.id },
    });
  }

  return toDto(comment);
}

export async function deleteComment(projectId: string, id: string, userId: string) {
  const existing = await prisma.projectComment.findFirst({ where: { id, projectId } });
  if (!existing) throw new NotFoundError("Comentario no encontrado");
  // Solo el autor puede borrar su comentario.
  if (existing.userId !== userId) throw new ForbiddenError("Solo el autor puede borrar el comentario");
  await prisma.projectComment.delete({ where: { id } });
}
