import { z } from "zod";
import { ActivityLevel, DietGoal, Sex } from "shared";

export const createFitnessLogSchema = z.object({
  date: z.string().datetime(),
  weightKg: z.number().positive().optional(),
  measurements: z.record(z.string(), z.number()).optional(),
  routineCompliance: z.number().min(0).max(100).optional(),
});

export const createDietPlanSchema = z.object({
  ageYears: z.number().int().positive(),
  sex: z.enum([...Sex]),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  activityLevel: z.enum([...ActivityLevel]),
  goal: z.enum([...DietGoal]),
});
