import { z } from "zod";
import { DeliverableStatus } from "shared";

export const createDeliverableSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateDeliverableSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum([...DeliverableStatus]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});
