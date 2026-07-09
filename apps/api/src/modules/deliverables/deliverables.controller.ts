import { Router } from "express";
import { authorizeGroupMembership } from "../../middleware/authorize-group.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createDeliverableSchema, updateDeliverableSchema } from "./deliverables.schema";
import * as service from "./deliverables.service";

// Montado en /api/projects/:projectId/deliverables (mergeParams).
export const deliverablesRouter = Router({ mergeParams: true });
deliverablesRouter.use(authorizeGroupMembership({ source: "project" }));

deliverablesRouter.get(
  "/",
  asyncHandler(async (req, res) => ok(res, await service.listDeliverables(req.params.projectId))),
);

deliverablesRouter.post(
  "/",
  validateBody(createDeliverableSchema),
  asyncHandler(async (req, res) => {
    const d = await service.createDeliverable(req.params.projectId, req.user!.userId, req.body);
    return ok(res, d, 201);
  }),
);

deliverablesRouter.patch(
  "/:id",
  validateBody(updateDeliverableSchema),
  asyncHandler(async (req, res) => {
    const d = await service.updateDeliverable(req.params.projectId, req.params.id, req.body);
    return ok(res, d);
  }),
);

deliverablesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.deleteDeliverable(req.params.projectId, req.params.id);
    return ok(res, null);
  }),
);
