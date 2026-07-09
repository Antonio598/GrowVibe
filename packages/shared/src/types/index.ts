import type {
  ActivityLevel,
  DeliverableStatus,
  DietGoal,
  GroupRole,
  NotificationType,
  ProjectStatus,
  ProjectType,
  Sex,
  TaskPriority,
  TaskStatus,
  TransactionType,
} from "../constants";

export interface Profile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: Profile;
}

export interface Task {
  id: string;
  userId: string;
  assigneeId: string | null;
  assigneeName?: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface FinanceSummary {
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Array<{ categoryId: string | null; categoryName: string; total: number }>;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  userName?: string;
  userEmail?: string;
}

export interface Project {
  id: string;
  groupId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  type: ProjectType;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  dueDate: string | null;
  deliveredAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkSession {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  createdAt: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface FitnessLog {
  id: string;
  userId: string;
  date: string;
  weightKg: number | null;
  measurements: Record<string, number> | null;
  routineCompliance: number | null;
}

export interface DietPlan {
  id: string;
  userId: string;
  ageYears: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: DietGoal;
  bmr: number;
  tdee: number;
  targetCalories: number;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}
