import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeGroupMembership } from "../../middleware/authorize-group.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createProjectSchema, updateProjectSchema } from "./projects.schema";
import * as projectsService from "./projects.service";
import { ValidationError } from "../../utils/errors";

export const projectsRouter = Router();
projectsRouter.use(authenticate);

projectsRouter.get(
  "/",
  authorizeGroupMembership({ source: "group" }),
  asyncHandler(async (req, res) => {
    const groupId = req.query.groupId as string | undefined;
    if (!groupId) throw new ValidationError("groupId es requerido");
    return ok(res, await projectsService.listProjects(groupId));
  }),
);

projectsRouter.post(
  "/",
  validateBody(createProjectSchema),
  authorizeGroupMembership({ source: "group" }),
  asyncHandler(async (req, res) => {
    const { groupId, name, progress } = req.body as { groupId: string; name: string; progress?: number };
    const project = await projectsService.createProject(groupId, name, progress);
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
