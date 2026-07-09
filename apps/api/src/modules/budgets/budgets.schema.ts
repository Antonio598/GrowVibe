import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().nullable().optional(),
  amount: z.number().positive(),
});

export const updateBudgetSchema = z.object({
  categoryId: z.string().nullable().optional(),
  amount: z.number().positive().optional(),
});
