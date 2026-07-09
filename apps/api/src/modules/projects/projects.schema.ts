import { z } from "zod";
import { ProjectStatus, ProjectType } from "shared";

export const createProjectSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([...ProjectType]).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum([...ProjectStatus]).optional(),
  type: z.enum([...ProjectType]).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});
