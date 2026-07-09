import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createBudgetSchema, updateBudgetSchema } from "./budgets.schema";
import * as service from "./budgets.service";

// Montado en /api/finance/budgets (hereda authenticate del financeRouter).
export const budgetsRouter = Router();

budgetsRouter.get("/", asyncHandler(async (req, res) => ok(res, await service.listBudgets(req.user!.userId))));

budgetsRouter.post(
  "/",
  validateBody(createBudgetSchema),
  asyncHandler(async (req, res) => ok(res, await service.createBudget(req.user!.userId, req.body), 201)),
);

budgetsRouter.patch(
  "/:id",
  validateBody(updateBudgetSchema),
  asyncHandler(async (req, res) => ok(res, await service.updateBudget(req.user!.userId, req.params.id, req.body))),
);

budgetsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.deleteBudget(req.user!.userId, req.params.id);
    return ok(res, null);
  }),
);
