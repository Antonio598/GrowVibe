import { prisma } from "../../config/database";
import { calculateCalories } from "../../utils/calorie-calculator";
import { NotFoundError } from "../../utils/errors";
import type { ActivityLevel, DietGoal, Sex } from "shared";

// measurements se guarda como JSON string en SQLite; se parsea al leer.
function toLogDto(log: { measurements: string | null } & Record<string, unknown>) {
  return {
    ...log,
    measurements: log.measurements ? (JSON.parse(log.measurements) as Record<string, number>) : null,
  };
}

export async function listLogs(userId: string) {
  const logs = await prisma.fitnessLog.findMany({ where: { userId }, orderBy: { date: "desc" } });
  return logs.map(toLogDto);
}

interface LogInput {
  date?: string;
  weightKg?: number;
  measurements?: Record<string, number>;
  routineCompliance?: number;
}

export async function createLog(userId: string, data: LogInput) {
  const log = await prisma.fitnessLog.create({
    data: {
      userId,
      date: data.date ? new Date(data.date) : new Date(),
      weightKg: data.weightKg ?? null,
      measurements: data.measurements ? JSON.stringify(data.measurements) : null,
      routineCompliance: data.routineCompliance ?? null,
    },
  });
  return toLogDto(log);
}

export async function updateLog(userId: string, id: string, data: LogInput) {
  const existing = await prisma.fitnessLog.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Registro no encontrado");
  const log = await prisma.fitnessLog.update({
    where: { id },
    data: {
      ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
      ...(data.weightKg !== undefined ? { weightKg: data.weightKg } : {}),
      ...(data.measurements !== undefined
        ? { measurements: data.measurements ? JSON.stringify(data.measurements) : null }
        : {}),
      ...(data.routineCompliance !== undefined ? { routineCompliance: data.routineCompliance } : {}),
    },
  });
  return toLogDto(log);
}

export async function deleteLog(userId: string, id: string) {
  const existing = await prisma.fitnessLog.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Registro no encontrado");
  await prisma.fitnessLog.delete({ where: { id } });
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

export function listDietPlans(userId: string) {
  return prisma.dietPlan.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export function getLatestDietPlan(userId: string) {
  return prisma.dietPlan.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
}
