import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../utils/async-handler";
import { validateBody } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth.middleware";
import { ok } from "../../utils/response";
import { acceptInviteSchema, createInviteSchema, loginSchema, refreshSchema } from "./auth.schema";
import * as authService from "./auth.service";

export const authRouter = Router();

// Rate limit en memoria contra fuerza bruta sobre login/aceptación de invitación.
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

authRouter.post(
  "/invites",
  authenticate,
  validateBody(createInviteSchema),
  asyncHandler(async (req, res) => {
    const { email, groupId } = req.body as { email: string; groupId?: string };
    const invite = await authService.createInvite(req.user!.userId, email, groupId);
    return ok(res, invite, 201);
  }),
);

authRouter.post(
  "/accept-invite",
  authRateLimit,
  validateBody(acceptInviteSchema),
  asyncHandler(async (req, res) => {
    const { token, name, password } = req.body as { token: string; name: string; password: string };
    const session = await authService.acceptInvite(token, name, password);
    return ok(res, session, 201);
  }),
);

authRouter.post(
  "/login",
  authRateLimit,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const session = await authService.login(email, password);
    return ok(res, session);
  }),
);

authRouter.post(
  "/refresh",
  validateBody(refreshSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refresh(refreshToken);
    return ok(res, result);
  }),
);

authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(async (_req, res) => {
    // Sin lista negra de refresh tokens en el esqueleto: el cliente descarta
    // los tokens localmente. TODO: invalidar refresh tokens server-side.
    return ok(res, null);
  }),
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const profile = await authService.getProfile(req.user!.userId);
    return ok(res, profile);
  }),
);
