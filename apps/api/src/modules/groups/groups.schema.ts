import { z } from "zod";
import { GroupRole } from "shared";

export const createGroupSchema = z.object({
  name: z.string().min(1),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum([...GroupRole]).optional(),
});

export const updateMemberSchema = z.object({
  role: z.enum([...GroupRole]),
});
