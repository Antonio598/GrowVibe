import { Router } from "express";
import { authorizeGroupMembership } from "../../middleware/authorize-group.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createSessionSchema, updateSessionSchema } from "./sessions.schema";
import * as service from "./sessions.service";

// Montado en /api/projects/:projectId/sessions (mergeParams).
export const sessionsRouter = Router({ mergeParams: true });
sessionsRouter.use(authorizeGroupMembership({ source: "project" }));

sessionsRouter.get(
  "/",
  asyncHandler(async (req, res) => ok(res, await service.listSessions(req.params.projectId))),
);

sessionsRouter.post(
  "/",
  validateBody(createSessionSchema),
  asyncHandler(async (req, res) => {
    const s = await service.createSession(req.params.projectId, req.user!.userId, req.body);
    return ok(res, s, 201);
  }),
);

sessionsRouter.patch(
  "/:id",
  validateBody(updateSessionSchema),
  asyncHandler(async (req, res) => {
    const s = await service.updateSession(req.params.projectId, req.params.id, req.body);
    return ok(res, s);
  }),
);

sessionsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.deleteSession(req.params.projectId, req.params.id);
    return ok(res, null);
  }),
);
