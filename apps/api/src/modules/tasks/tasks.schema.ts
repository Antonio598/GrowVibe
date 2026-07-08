import { z } from "zod";
import { TaskPriority, TaskStatus } from "shared";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum([...TaskStatus]).optional(),
  priority: z.enum([...TaskPriority]).optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
