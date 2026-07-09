import { prisma } from "../../config/database";
import { ForbiddenError, NotFoundError, ValidationError } from "../../utils/errors";
import { notify } from "../../services/notification-dispatcher.service";

export interface TaskFilters {
  status?: string;
  priority?: string;
  projectId?: string;
  assignee?: string; // "me" para ver solo las asignadas al usuario
}

const taskInclude = { assignee: { select: { name: true } } } as const;

function toTaskDto(task: Record<string, unknown> & { assignee?: { name: string } | null }) {
  const { assignee, ...rest } = task;
  return { ...rest, assigneeName: assignee?.name ?? null };
}

// Verifica que el usuario pertenezca al grupo del proyecto. Devuelve el proyecto.
async function assertProjectMember(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError("Proyecto no encontrado");
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: project.groupId, userId } },
  });
  if (!membership) throw new ForbiddenError("No perteneces al grupo de este proyecto");
  return project;
}

// Autoriza el acceso a una tarea: dueño, asignado, o miembro del grupo del proyecto.
async function authorizeTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError("Tarea no encontrada");
  const isOwner = task.userId === userId;
  const isAssignee = task.assigneeId === userId;
  let isProjectMember = false;
  if (task.projectId) {
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    if (project) {
      const membership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: project.groupId, userId } },
      });
      isProjectMember = Boolean(membership);
    }
  }
  if (!isOwner && !isAssignee && !isProjectMember) throw new ForbiddenError("No tienes acceso a esta tarea");
  return task;
}

export async function listTasks(userId: string, filters: TaskFilters) {
  // Vista de proyecto: todas las tareas del proyecto (requiere membresía).
  if (filters.projectId) {
    await assertProjectMember(userId, filters.projectId);
    const tasks = await prisma.task.findMany({
      where: {
        projectId: filters.projectId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.assignee === "me" ? { assigneeId: userId } : {}),
      },
      include: taskInclude,
      orderBy: { createdAt: "desc" },
    });
    return tasks.map(toTaskDto);
  }

  // Vista personal: tareas propias + asignadas a mí.
  const tasks = await prisma.task.findMany({
    where: {
      ...(filters.assignee === "me" ? { assigneeId: userId } : { OR: [{ userId }, { assigneeId: userId }] }),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
    },
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
  return tasks.map(toTaskDto);
}

async function resolveAssignee(userId: string, projectId: string | null, assigneeId: unknown) {
  if (assigneeId === undefined) return undefined;
  if (assigneeId === null || assigneeId === "") return null;
  const id = assigneeId as string;
  // Solo se puede asignar a un miembro del grupo del proyecto.
  if (!projectId) throw new ValidationError("Solo las tareas de un proyecto pueden asignarse a un miembro");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError("Proyecto no encontrado");
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: project.groupId, userId: id } },
  });
  if (!membership) throw new ValidationError("El asignado no pertenece al grupo del proyecto");
  return id;
}

export async function createTask(userId: string, data: Record<string, unknown>) {
  const projectId = (data.projectId as string) ?? null;
  if (projectId) await assertProjectMember(userId, projectId);
  const assigneeId = await resolveAssignee(userId, projectId, data.assigneeId);

  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title as string,
      description: (data.description as string) ?? null,
      status: (data.status as string) ?? "pending",
      priority: (data.priority as string) ?? "medium",
      dueDate: data.dueDate ? new Date(data.dueDate as string) : null,
      projectId,
      assigneeId: assigneeId ?? null,
    },
    include: taskInclude,
  });

  if (assigneeId && assigneeId !== userId) {
    void notify({
      userId: assigneeId,
      type: "task_assigned",
      message: `Te asignaron la tarea "${task.title}"`,
      metadata: { taskId: task.id, projectId },
    });
  }

  return toTaskDto(task);
}

export async function updateTask(userId: string, taskId: string, data: Record<string, unknown>) {
  const existing = await authorizeTaskAccess(userId, taskId);

  const nextProjectId =
    data.projectId !== undefined ? ((data.projectId as string) || null) : existing.projectId;
  const assigneeId = await resolveAssignee(userId, nextProjectId, data.assigneeId);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined ? { title: data.title as string } : {}),
      ...(data.description !== undefined ? { description: data.description as string } : {}),
      ...(data.status !== undefined ? { status: data.status as string } : {}),
      ...(data.priority !== undefined ? { priority: data.priority as string } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate as string) : null } : {}),
      ...(data.projectId !== undefined ? { projectId: nextProjectId } : {}),
      ...(assigneeId !== undefined ? { assigneeId } : {}),
    },
    include: taskInclude,
  });

  if (assigneeId && assigneeId !== userId && assigneeId !== existing.assigneeId) {
    void notify({
      userId: assigneeId,
      type: "task_assigned",
      message: `Te asignaron la tarea "${task.title}"`,
      metadata: { taskId: task.id, projectId: task.projectId },
    });
  }

  return toTaskDto(task);
}

export async function deleteTask(userId: string, taskId: string) {
  await authorizeTaskAccess(userId, taskId);
  await prisma.task.delete({ where: { id: taskId } });
}
