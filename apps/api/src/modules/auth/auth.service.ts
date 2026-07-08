import { randomBytes } from "node:crypto";
import { prisma } from "../../config/database";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../utils/errors";

const INVITE_TTL_DAYS = 7;

function toProfileDto(profile: { id: string; email: string; name: string; createdAt: Date }) {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    createdAt: profile.createdAt.toISOString(),
  };
}

export async function createInvite(invitedBy: string, email: string, groupId?: string) {
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Ya existe un usuario con ese email");

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: { email, token, groupId, invitedBy, expiresAt },
  });

  return { token: invite.token, expiresAt: invite.expiresAt.toISOString() };
}

export async function acceptInvite(token: string, name: string, password: string) {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.status !== "pending") throw new NotFoundError("Invitación inválida");
  if (invite.expiresAt < new Date()) throw new ValidationError("La invitación expiró");

  const passwordHash = await hashPassword(password);

  const profile = await prisma.$transaction(async (tx) => {
    const created = await tx.profile.create({
      data: { email: invite.email, passwordHash, name },
    });

    await tx.invite.update({ where: { id: invite.id }, data: { status: "accepted" } });

    if (invite.groupId) {
      await tx.groupMember.create({
        data: { groupId: invite.groupId, userId: created.id, role: "member" },
      });
    }

    return created;
  });

  const payload = { userId: profile.id, email: profile.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: toProfileDto(profile),
  };
}

export async function login(email: string, password: string) {
  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile) throw new UnauthorizedError("Credenciales inválidas");

  const valid = await verifyPassword(password, profile.passwordHash);
  if (!valid) throw new UnauthorizedError("Credenciales inválidas");

  const payload = { userId: profile.id, email: profile.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: toProfileDto(profile),
  };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Refresh token inválido o expirado");
  }

  const profile = await prisma.profile.findUnique({ where: { id: payload.userId } });
  if (!profile) throw new UnauthorizedError("Usuario no encontrado");

  return { accessToken: signAccessToken({ userId: profile.id, email: profile.email }) };
}

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) throw new NotFoundError("Perfil no encontrado");
  return toProfileDto(profile);
}
