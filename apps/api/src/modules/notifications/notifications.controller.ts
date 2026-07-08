import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import * as notificationsService from "./notifications.service";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const readParam = req.query.read as string | undefined;
    const read = readParam === undefined ? undefined : readParam === "true";
    const result = await notificationsService.listNotifications(req.user!.userId, page, pageSize, read);
    return ok(res, result);
  }),
);

notificationsRouter.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    await notificationsService.markAllRead(req.user!.userId);
    return ok(res, null);
  }),
);

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await notificationsService.markRead(req.user!.userId, req.params.id);
    return ok(res, notification);
  }),
);

notificationsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await notificationsService.deleteNotification(req.user!.userId, req.params.id);
    return ok(res, null);
  }),
);
