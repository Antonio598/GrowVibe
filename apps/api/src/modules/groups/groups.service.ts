import { prisma } from "../../config/database";
import { ConflictError, NotFoundError } from "../../utils/errors";

export function listGroupsForUser(userId: string) {
  return prisma.group.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGroup(userId: string, name: string) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.group.create({ data: { name, createdBy: userId } });
    await tx.groupMember.create({ data: { groupId: group.id, userId, role: "owner" } });
    return group;
  });
}

export function getGroup(groupId: string) {
  return prisma.group.findUnique({ where: { id: groupId } });
}

export async function listMembers(groupId: string) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { role: "asc" },
  });
  return members.map((m) => ({
    id: m.id,
    groupId: m.groupId,
    userId: m.userId,
    role: m.role,
    userName: m.user.name,
    userEmail: m.user.email,
  }));
}

export async function renameGroup(groupId: string, name: string) {
  const existing = await prisma.group.findUnique({ where: { id: groupId } });
  if (!existing) throw new NotFoundError("Grupo no encontrado");
  return prisma.group.update({ where: { id: groupId }, data: { name } });
}

export async function deleteGroup(groupId: string) {
  const existing = await prisma.group.findUnique({ where: { id: groupId } });
  if (!existing) throw new NotFoundError("Grupo no encontrado");
  // Cascade (schema onDelete) borra members, projects, invites, y en cascada
  // deliverables/sessions/comments; las tareas quedan con projectId = null.
  await prisma.group.delete({ where: { id: groupId } });
}

export async function addMember(groupId: string, userId: string, role = "member") {
  const user = await prisma.profile.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("Usuario no encontrado");

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (existing) throw new ConflictError("El usuario ya pertenece al grupo");

  return prisma.groupMember.create({ data: { groupId, userId, role } });
}

export async function removeMember(groupId: string, userId: string) {
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!existing) throw new NotFoundError("Membresía no encontrada");
  await prisma.groupMember.delete({ where: { id: existing.id } });
}

export async function updateMemberRole(groupId: string, userId: string, role: string) {
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!existing) throw new NotFoundError("Membresía no encontrada");
  return prisma.groupMember.update({ where: { id: existing.id }, data: { role } });
}
