import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { contributeSchema, createGoalSchema, updateGoalSchema } from "./goals.schema";
import * as service from "./goals.service";

// Montado en /api/finance/goals (hereda authenticate del financeRouter).
export const goalsRouter = Router();

goalsRouter.get("/", asyncHandler(async (req, res) => ok(res, await service.listGoals(req.user!.userId))));

goalsRouter.post(
  "/",
  validateBody(createGoalSchema),
  asyncHandler(async (req, res) => ok(res, await service.createGoal(req.user!.userId, req.body), 201)),
);

goalsRouter.patch(
  "/:id",
  validateBody(updateGoalSchema),
  asyncHandler(async (req, res) => ok(res, await service.updateGoal(req.user!.userId, req.params.id, req.body))),
);

goalsRouter.post(
  "/:id/contribute",
  validateBody(contributeSchema),
  asyncHandler(async (req, res) => {
    const goal = await service.contribute(req.user!.userId, req.params.id, (req.body as { amount: number }).amount);
    return ok(res, goal);
  }),
);

goalsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.deleteGoal(req.user!.userId, req.params.id);
    return ok(res, null);
  }),
);
