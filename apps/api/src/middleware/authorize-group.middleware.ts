import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/errors";
import type { GroupRole } from "shared";

const ROLE_RANK: Record<GroupRole, number> = { member: 0, admin: 1, owner: 2 };

async function resolveGroupId(req: Request, source: "group" | "project"): Promise<string> {
  if (source === "group") {
    const groupId =
      req.params.groupId ??
      req.params.id ??
      (req.query.groupId as string | undefined) ??
      (req.body as { groupId?: string })?.groupId;
    if (!groupId) throw new NotFoundError("Grupo no especificado");
    return groupId;
  }

  const projectId = req.params.projectId ?? req.params.id;
  if (!projectId) throw new NotFoundError("Proyecto no especificado");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError("Proyecto no encontrado");
  return project.groupId;
}

// Valida que req.user pertenezca al grupo (directamente o vía projectId -> groupId)
// y opcionalmente cumpla un rol mínimo dentro de ese grupo.
export function authorizeGroupMembership(options: { source: "group" | "project"; minRole?: GroupRole } = { source: "group" }) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();

    const groupId = await resolveGroupId(req, options.source);
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.userId } },
    });

    if (!membership) throw new ForbiddenError("No perteneces a este grupo");

    if (options.minRole && ROLE_RANK[membership.role as GroupRole] < ROLE_RANK[options.minRole]) {
      throw new ForbiddenError(`Se requiere rol mínimo: ${options.minRole}`);
    }

    req.groupId = groupId;
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      groupId?: string;
    }
  }
}
