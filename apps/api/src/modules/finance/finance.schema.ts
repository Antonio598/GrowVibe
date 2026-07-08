import { z } from "zod";
import { TransactionType } from "shared";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum([...TransactionType]),
});

export const createTransactionSchema = z.object({
  type: z.enum([...TransactionType]),
  amount: z.number().positive(),
  categoryId: z.string().optional(),
  date: z.string().datetime(),
  note: z.string().optional(),
});
