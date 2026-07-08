import { Router } from "express";
import { authRouter } from "../modules/auth/auth.controller";
import { tasksRouter } from "../modules/tasks/tasks.controller";
import { financeRouter } from "../modules/finance/finance.controller";
import { groupsRouter } from "../modules/groups/groups.controller";
import { projectsRouter } from "../modules/projects/projects.controller";
import { notificationsRouter } from "../modules/notifications/notifications.controller";
import { fitnessRouter } from "../modules/fitness/fitness.controller";
import { runNotificationChecks } from "../services/notification-jobs.service";
import { asyncHandler } from "../utils/async-handler";
import { ok } from "../utils/response";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.status(200).json({ status: "success", data: { up: true } }));

apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/finance", financeRouter);
apiRouter.use("/groups", groupsRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/fitness", fitnessRouter);

// Endpoint temporal para disparar manualmente el job de notificaciones
// programadas (vencimientos/atrasos/recordatorios) durante la verificación
// del esqueleto, sin esperar al cron horario.
apiRouter.post(
  "/internal/run-notification-check",
  asyncHandler(async (_req, res) => {
    const result = await runNotificationChecks();
    return ok(res, result);
  }),
);
