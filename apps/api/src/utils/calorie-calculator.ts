import type { ActivityLevel, DietGoal, Sex } from "shared";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_ADJUSTMENT: Record<DietGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

export interface CalorieInput {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: DietGoal;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
}

// Fórmula Mifflin-St Jeor: estándar clínico, sin dependencia de API externa.
export function calculateCalories(input: CalorieInput): CalorieResult {
  const sexOffset = input.sex === "male" ? 5 : -161;
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears + sexOffset;
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const targetCalories = tdee + GOAL_CALORIE_ADJUSTMENT[input.goal];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
  };
}
