import { z } from "zod";

export const createProjectSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1),
  progress: z.number().min(0).max(100).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  progress: z.number().min(0).max(100).optional(),
});
