import { Router } from "express";
import { authorizeGroupMembership } from "../../middleware/authorize-group.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createCommentSchema } from "./comments.schema";
import * as service from "./comments.service";

// Montado en /api/projects/:projectId/comments (mergeParams).
export const commentsRouter = Router({ mergeParams: true });
commentsRouter.use(authorizeGroupMembership({ source: "project" }));

commentsRouter.get(
  "/",
  asyncHandler(async (req, res) => ok(res, await service.listComments(req.params.projectId))),
);

commentsRouter.post(
  "/",
  validateBody(createCommentSchema),
  asyncHandler(async (req, res) => {
    const c = await service.createComment(req.params.projectId, req.user!.userId, (req.body as { body: string }).body);
    return ok(res, c, 201);
  }),
);

commentsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.deleteComment(req.params.projectId, req.params.id, req.user!.userId);
    return ok(res, null);
  }),
);
