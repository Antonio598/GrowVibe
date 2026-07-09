import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/errors";

const sessionInclude = { user: { select: { name: true } } } as const;

function toDto(s: Record<string, unknown> & { user?: { name: string } }) {
  const { user, ...rest } = s;
  return { ...rest, userName: user?.name };
}

export async function listSessions(projectId: string) {
  const sessions = await prisma.workSession.findMany({
    where: { projectId },
    include: sessionInclude,
    orderBy: { startedAt: "desc" },
  });
  return sessions.map(toDto);
}

// Sin startedAt = iniciar timer ahora. Con startedAt+endedAt = sesión manual.
export async function createSession(
  projectId: string,
  userId: string,
  data: { startedAt?: string; endedAt?: string; note?: string },
) {
  const s = await prisma.workSession.create({
    data: {
      projectId,
      userId,
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
      endedAt: data.endedAt ? new Date(data.endedAt) : null,
      note: data.note ?? null,
    },
    include: sessionInclude,
  });
  return toDto(s);
}

export async function updateSession(
  projectId: string,
  id: string,
  data: { startedAt?: string; endedAt?: string | null; note?: string | null },
) {
  const existing = await prisma.workSession.findFirst({ where: { id, projectId } });
  if (!existing) throw new NotFoundError("Sesión no encontrada");

  const s = await prisma.workSession.update({
    where: { id },
    data: {
      ...(data.startedAt !== undefined ? { startedAt: new Date(data.startedAt) } : {}),
      ...(data.endedAt !== undefined ? { endedAt: data.endedAt ? new Date(data.endedAt) : null } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
    },
    include: sessionInclude,
  });
  return toDto(s);
}

export async function deleteSession(projectId: string, id: string) {
  const existing = await prisma.workSession.findFirst({ where: { id, projectId } });
  if (!existing) throw new NotFoundError("Sesión no encontrada");
  await prisma.workSession.delete({ where: { id } });
}
