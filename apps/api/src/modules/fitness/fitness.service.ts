import { prisma } from "../../config/database";
import { calculateCalories } from "../../utils/calorie-calculator";
import type { ActivityLevel, DietGoal, Sex } from "shared";

export function listLogs(userId: string) {
  return prisma.fitnessLog.findMany({ where: { userId }, orderBy: { date: "desc" } });
}

export function createLog(
  userId: string,
  data: { date: string; weightKg?: number; measurements?: Record<string, number>; routineCompliance?: number },
) {
  return prisma.fitnessLog.create({
    data: {
      userId,
      date: new Date(data.date),
      weightKg: data.weightKg ?? null,
      measurements: data.measurements ? JSON.stringify(data.measurements) : null,
      routineCompliance: data.routineCompliance ?? null,
    },
  });
}

export interface DietPlanInput {
  ageYears: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: DietGoal;
}

export function createDietPlan(userId: string, input: DietPlanInput) {
  const { bmr, tdee, targetCalories } = calculateCalories(input);

  return prisma.dietPlan.create({
    data: {
      userId,
      ageYears: input.ageYears,
      sex: input.sex,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      activityLevel: input.activityLevel,
      goal: input.goal,
      bmr,
      tdee,
      targetCalories,
    },
  });
}

export function getLatestDietPlan(userId: string) {
  return prisma.dietPlan.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
}
