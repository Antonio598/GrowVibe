import { z } from "zod";
import { TransactionType } from "shared";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum([...TransactionType]),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum([...TransactionType]).optional(),
});

export const createTransactionSchema = z.object({
  type: z.enum([...TransactionType]),
  amount: z.number().positive(),
  categoryId: z.string().nullable().optional(),
  date: z.string().datetime(),
  note: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  type: z.enum([...TransactionType]).optional(),
  amount: z.number().positive().optional(),
  categoryId: z.string().nullable().optional(),
  date: z.string().datetime().optional(),
  note: z.string().nullable().optional(),
});
