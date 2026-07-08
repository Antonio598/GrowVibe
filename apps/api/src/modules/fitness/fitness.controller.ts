import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createDietPlanSchema, createFitnessLogSchema } from "./fitness.schema";
import * as fitnessService from "./fitness.service";

export const fitnessRouter = Router();
fitnessRouter.use(authenticate);

fitnessRouter.get(
  "/logs",
  asyncHandler(async (req, res) => ok(res, await fitnessService.listLogs(req.user!.userId))),
);

fitnessRouter.post(
  "/logs",
  validateBody(createFitnessLogSchema),
  asyncHandler(async (req, res) => {
    const log = await fitnessService.createLog(req.user!.userId, req.body);
    return ok(res, log, 201);
  }),
);

fitnessRouter.post(
  "/diet-plans",
  validateBody(createDietPlanSchema),
  asyncHandler(async (req, res) => {
    const plan = await fitnessService.createDietPlan(req.user!.userId, req.body);
    return ok(res, plan, 201);
  }),
);

fitnessRouter.get(
  "/diet-plans/latest",
  asyncHandler(async (req, res) => ok(res, await fitnessService.getLatestDietPlan(req.user!.userId))),
);
