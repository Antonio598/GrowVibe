import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/response";
import { createCategorySchema, createTransactionSchema } from "./finance.schema";
import * as financeService from "./finance.service";

export const financeRouter = Router();
financeRouter.use(authenticate);

financeRouter.get(
  "/categories",
  asyncHandler(async (req, res) => ok(res, await financeService.listCategories(req.user!.userId))),
);

financeRouter.post(
  "/categories",
  validateBody(createCategorySchema),
  asyncHandler(async (req, res) => {
    const { name, type } = req.body as { name: string; type: string };
    const category = await financeService.createCategory(req.user!.userId, name, type);
    return ok(res, category, 201);
  }),
);

financeRouter.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const { type, categoryId, from, to } = req.query as Record<string, string | undefined>;
    const transactions = await financeService.listTransactions(req.user!.userId, { type, categoryId, from, to });
    return ok(res, transactions);
  }),
);

financeRouter.post(
  "/transactions",
  validateBody(createTransactionSchema),
  asyncHandler(async (req, res) => {
    const transaction = await financeService.createTransaction(req.user!.userId, req.body);
    return ok(res, transaction, 201);
  }),
);

financeRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const { from, to } = req.query as Record<string, string | undefined>;
    const summary = await financeService.getSummary(req.user!.userId, from, to);
    return ok(res, summary);
  }),
);
