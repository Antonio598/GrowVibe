import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeGroupMembership } from "../../middleware/authorize-group.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createProjectSchema, updateProjectSchema } from "./projects.schema";
import * as projectsService from "./projects.service";
import { ValidationError } from "../../utils/errors";
import { deliverablesRouter } from "../deliverables/deliverables.controller";
import { sessionsRouter } from "../sessions/sessions.controller";
import { commentsRouter } from "../comments/comments.controller";

export const projectsRouter = Router();
projectsRouter.use(authenticate);

// Recursos anidados por proyecto (heredan authenticate; cada uno valida
// membresía del grupo del proyecto vía mergeParams + authorizeGroupMembership).
projectsRouter.use("/:projectId/deliverables", deliverablesRouter);
projectsRouter.use("/:projectId/sessions", sessionsRouter);
projectsRouter.use("/:projectId/comments", commentsRouter);

projectsRouter.get(
  "/",
  authorizeGroupMembership({ source: "group" }),
  asyncHandler(async (req, res) => {
    const groupId = req.query.groupId as string | undefined;
    if (!groupId) throw new ValidationError("groupId es requerido");
    return ok(res, await projectsService.listProjects(groupId));
  }),
);

projectsRouter.get(
  "/:id",
  authorizeGroupMembership({ source: "project" }),
  asyncHandler(async (req, res) => ok(res, await projectsService.getProject(req.params.id))),
);

projectsRouter.post(
  "/",
  validateBody(createProjectSchema),
  authorizeGroupMembership({ source: "group" }),
  asyncHandler(async (req, res) => {
    const { groupId, ...data } = req.body as { groupId: string } & Record<string, unknown>;
    const project = await projectsService.createProject(groupId, data as never);
    return ok(res, project, 201);
  }),
);

projectsRouter.patch(
  "/:id",
  authorizeGroupMembership({ source: "project" }),
  validateBody(updateProjectSchema),
  asyncHandler(async (req, res) => {
    const project = await projectsService.updateProject(req.params.id, req.body, req.user!.userId);
    return ok(res, project);
  }),
);

projectsRouter.delete(
  "/:id",
  authorizeGroupMembership({ source: "project" }),
  asyncHandler(async (req, res) => {
    await projectsService.deleteProject(req.params.id);
    return ok(res, null);
  }),
);
