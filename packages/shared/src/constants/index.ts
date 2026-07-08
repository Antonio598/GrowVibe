export const TaskStatus = ["pending", "in_progress", "done"] as const;
export type TaskStatus = (typeof TaskStatus)[number];

export const TaskPriority = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TaskPriority)[number];

export const TransactionType = ["income", "expense"] as const;
export type TransactionType = (typeof TransactionType)[number];

export const GroupRole = ["owner", "admin", "member"] as const;
export type GroupRole = (typeof GroupRole)[number];

export const InviteStatus = ["pending", "accepted", "expired"] as const;
export type InviteStatus = (typeof InviteStatus)[number];

export const NotificationType = [
  "task_due",
  "task_overdue",
  "expense_high",
  "goal_reached",
  "project_update",
  "routine_reminder",
] as const;
export type NotificationType = (typeof NotificationType)[number];

export const ActivityLevel = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export type ActivityLevel = (typeof ActivityLevel)[number];

export const DietGoal = ["lose", "maintain", "gain"] as const;
export type DietGoal = (typeof DietGoal)[number];

export const Sex = ["male", "female"] as const;
export type Sex = (typeof Sex)[number];
