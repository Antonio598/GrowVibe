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
  "task_assigned",
  "comment_added",
  "deliverable_due",
] as const;
export type NotificationType = (typeof NotificationType)[number];

export const ProjectStatus = ["active", "paused", "done"] as const;
export type ProjectStatus = (typeof ProjectStatus)[number];

export const ProjectType = ["ongoing", "dated"] as const;
export type ProjectType = (typeof ProjectType)[number];

export const DeliverableStatus = ["pending", "delivered"] as const;
export type DeliverableStatus = (typeof DeliverableStatus)[number];

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
