import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createRecurringSchema, updateRecurringSchema } from "./recurring.schema";
import * as service from "./recurring.service";

// Montado en /api/finance/recurring (hereda authenticate del financeRouter).
export const recurringRouter = Router();

recurringRouter.get("/", asyncHandler(async (req, res) => ok(res, await service.listRecurring(req.user!.userId))));

recurringRouter.post(
  "/",
  validateBody(createRecurringSchema),
  asyncHandler(async (req, res) => ok(res, await service.createRecurring(req.user!.userId, req.body), 201)),
);

recurringRouter.patch(
  "/:id",
  validateBody(updateRecurringSchema),
  asyncHandler(async (req, res) => ok(res, await service.updateRecurring(req.user!.userId, req.params.id, req.body))),
);

recurringRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.deleteRecurring(req.user!.userId, req.params.id);
    return ok(res, null);
  }),
);
