import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const contributeSchema = z.object({
  amount: z.number(),
});
