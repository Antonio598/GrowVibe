import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createTaskSchema, updateTaskSchema } from "./tasks.schema";
import * as tasksService from "./tasks.service";

export const tasksRouter = Router();
tasksRouter.use(authenticate);

tasksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, priority, projectId, assignee } = req.query as Record<string, string | undefined>;
    const tasks = await tasksService.listTasks(req.user!.userId, { status, priority, projectId, assignee });
    return ok(res, tasks);
  }),
);

tasksRouter.post(
  "/",
  validateBody(createTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await tasksService.createTask(req.user!.userId, req.body);
    return ok(res, task, 201);
  }),
);

tasksRouter.patch(
  "/:id",
  validateBody(updateTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await tasksService.updateTask(req.user!.userId, req.params.id, req.body);
    return ok(res, task);
  }),
);

tasksRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await tasksService.deleteTask(req.user!.userId, req.params.id);
    return ok(res, null);
  }),
);
