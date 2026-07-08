import { prisma } from "../config/database";
import { sendToN8n } from "./webhook.service";
import type { NotificationType } from "shared";

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, unknown>;
}

// Punto central de notificaciones: persiste in-app y dispara el webhook n8n
// sin bloquear al caller (fire-and-forget sobre el envío al webhook).
export async function notify({ userId, type, message, metadata }: NotifyInput) {
  const user = await prisma.profile.findUnique({ where: { id: userId } });
  if (!user) return null;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  void sendToN8n({
    event: type,
    userId,
    userEmail: user.email,
    message,
    metadata: metadata ?? null,
    notificationId: notification.id,
    createdAt: notification.createdAt.toISOString(),
  });

  return notification;
}

export async function notifyMany(userIds: string[], input: Omit<NotifyInput, "userId">) {
  return Promise.all(userIds.map((userId) => notify({ ...input, userId })));
}
