import { HttpClient, type ApiClientConfig } from "./http";
import type {
  AuthSession,
  Category,
  DietPlan,
  FinanceSummary,
  FitnessLog,
  Group,
  GroupMember,
  Notification,
  Paginated,
  Profile,
  Project,
  Task,
  Transaction,
} from "../types";

export * from "./http";

export function createApiClient(config: ApiClientConfig) {
  const http = new HttpClient(config);

  return {
    auth: {
      login: (email: string, password: string) =>
        http.post<AuthSession>("/api/auth/login", { email, password }),
      acceptInvite: (token: string, name: string, password: string) =>
        http.post<AuthSession>("/api/auth/accept-invite", { token, name, password }),
      createInvite: (email: string, groupId?: string) =>
        http.post<{ token: string; expiresAt: string }>("/api/auth/invites", { email, groupId }),
      me: () => http.get<Profile>("/api/auth/me"),
      logout: () => http.post<void>("/api/auth/logout"),
    },
    tasks: {
      list: (query = "") => http.get<Task[]>(`/api/tasks${query}`),
      create: (data: Partial<Task>) => http.post<Task>("/api/tasks", data),
      update: (id: string, data: Partial<Task>) => http.patch<Task>(`/api/tasks/${id}`, data),
      remove: (id: string) => http.delete<void>(`/api/tasks/${id}`),
    },
    finance: {
      categories: () => http.get<Category[]>("/api/finance/categories"),
      createCategory: (data: Partial<Category>) => http.post<Category>("/api/finance/categories", data),
      transactions: (query = "") => http.get<Transaction[]>(`/api/finance/transactions${query}`),
      createTransaction: (data: Partial<Transaction>) =>
        http.post<Transaction>("/api/finance/transactions", data),
      summary: (query = "") => http.get<FinanceSummary>(`/api/finance/summary${query}`),
    },
    groups: {
      list: () => http.get<Group[]>("/api/groups"),
      create: (name: string) => http.post<Group>("/api/groups", { name }),
      members: (groupId: string) => http.get<GroupMember[]>(`/api/groups/${groupId}/members`),
      addMember: (groupId: string, userId: string, role?: string) =>
        http.post<GroupMember>(`/api/groups/${groupId}/members`, { userId, role }),
    },
    projects: {
      list: (groupId: string) => http.get<Project[]>(`/api/projects?groupId=${groupId}`),
      create: (data: Partial<Project> & { groupId: string }) => http.post<Project>("/api/projects", data),
      update: (id: string, data: Partial<Project>) => http.patch<Project>(`/api/projects/${id}`, data),
    },
    notifications: {
      list: (query = "") => http.get<Paginated<Notification>>(`/api/notifications${query}`),
      markRead: (id: string) => http.patch<Notification>(`/api/notifications/${id}/read`),
      markAllRead: () => http.patch<void>("/api/notifications/read-all"),
    },
    fitness: {
      logs: () => http.get<FitnessLog[]>("/api/fitness/logs"),
      createLog: (data: Partial<FitnessLog>) => http.post<FitnessLog>("/api/fitness/logs", data),
      latestDietPlan: () => http.get<DietPlan | null>("/api/fitness/diet-plans/latest"),
      createDietPlan: (data: Partial<DietPlan>) => http.post<DietPlan>("/api/fitness/diet-plans", data),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
