import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";

export async function listNotifications(userId: string, page: number, pageSize: number, read?: boolean) {
  const where = { userId, ...(read !== undefined ? { read } : {}) };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data, page, pageSize, total };
}

export async function markRead(userId: string, notificationId: string) {
  const existing = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!existing) throw new NotFoundError("Notificación no encontrada");
  return prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
}

export function markAllRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function deleteNotification(userId: string, notificationId: string) {
  const existing = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
  if (!existing) throw new NotFoundError("Notificación no encontrada");
  await prisma.notification.delete({ where: { id: notificationId } });
}
