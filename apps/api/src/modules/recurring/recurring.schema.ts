import { z } from "zod";
import { RecurrenceInterval, TransactionType } from "shared";

export const createRecurringSchema = z.object({
  type: z.enum([...TransactionType]),
  amount: z.number().positive(),
  categoryId: z.string().nullable().optional(),
  note: z.string().optional(),
  interval: z.enum([...RecurrenceInterval]),
  nextRun: z.string().datetime().optional(),
});

export const updateRecurringSchema = z.object({
  type: z.enum([...TransactionType]).optional(),
  amount: z.number().positive().optional(),
  categoryId: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  interval: z.enum([...RecurrenceInterval]).optional(),
  nextRun: z.string().datetime().optional(),
  active: z.boolean().optional(),
});
