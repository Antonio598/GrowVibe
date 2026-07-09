import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeGroupMembership } from "../../middleware/authorize-group.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { addMemberSchema, createGroupSchema, updateGroupSchema, updateMemberSchema } from "./groups.schema";
import * as groupsService from "./groups.service";

export const groupsRouter = Router();
groupsRouter.use(authenticate);

groupsRouter.get(
  "/",
  asyncHandler(async (req, res) => ok(res, await groupsService.listGroupsForUser(req.user!.userId))),
);

groupsRouter.post(
  "/",
  validateBody(createGroupSchema),
  asyncHandler(async (req, res) => {
    const group = await groupsService.createGroup(req.user!.userId, (req.body as { name: string }).name);
    return ok(res, group, 201);
  }),
);

groupsRouter.get(
  "/:id",
  authorizeGroupMembership({ source: "group" }),
  asyncHandler(async (req, res) => ok(res, await groupsService.getGroup(req.params.id))),
);

groupsRouter.patch(
  "/:id",
  authorizeGroupMembership({ source: "group", minRole: "admin" }),
  validateBody(updateGroupSchema),
  asyncHandler(async (req, res) => {
    const group = await groupsService.renameGroup(req.params.id, (req.body as { name: string }).name);
    return ok(res, group);
  }),
);

groupsRouter.delete(
  "/:id",
  authorizeGroupMembership({ source: "group", minRole: "owner" }),
  asyncHandler(async (req, res) => {
    await groupsService.deleteGroup(req.params.id);
    return ok(res, null);
  }),
);

groupsRouter.get(
  "/:id/members",
  authorizeGroupMembership({ source: "group" }),
  asyncHandler(async (req, res) => ok(res, await groupsService.listMembers(req.params.id))),
);

groupsRouter.post(
  "/:id/members",
  authorizeGroupMembership({ source: "group", minRole: "admin" }),
  validateBody(addMemberSchema),
  asyncHandler(async (req, res) => {
    const { userId, role } = req.body as { userId: string; role?: string };
    const member = await groupsService.addMember(req.params.id, userId, role);
    return ok(res, member, 201);
  }),
);

groupsRouter.patch(
  "/:id/members/:userId",
  authorizeGroupMembership({ source: "group", minRole: "admin" }),
  validateBody(updateMemberSchema),
  asyncHandler(async (req, res) => {
    const { role } = req.body as { role: string };
    const member = await groupsService.updateMemberRole(req.params.id, req.params.userId, role);
    return ok(res, member);
  }),
);

groupsRouter.delete(
  "/:id/members/:userId",
  authorizeGroupMembership({ source: "group", minRole: "admin" }),
  asyncHandler(async (req, res) => {
    await groupsService.removeMember(req.params.id, req.params.userId);
    return ok(res, null);
  }),
);
