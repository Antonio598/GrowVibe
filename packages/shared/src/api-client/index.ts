import { HttpClient, type ApiClientConfig } from "./http";
import type {
  AuthSession,
  Category,
  Deliverable,
  DietPlan,
  FinanceSummary,
  FitnessLog,
  Group,
  GroupMember,
  Notification,
  Paginated,
  Profile,
  Project,
  ProjectComment,
  Task,
  Transaction,
  WorkSession,
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
      updateCategory: (id: string, data: Partial<Category>) =>
        http.patch<Category>(`/api/finance/categories/${id}`, data),
      deleteCategory: (id: string) => http.delete<void>(`/api/finance/categories/${id}`),
      transactions: (query = "") => http.get<Transaction[]>(`/api/finance/transactions${query}`),
      createTransaction: (data: Partial<Transaction>) =>
        http.post<Transaction>("/api/finance/transactions", data),
      updateTransaction: (id: string, data: Partial<Transaction>) =>
        http.patch<Transaction>(`/api/finance/transactions/${id}`, data),
      deleteTransaction: (id: string) => http.delete<void>(`/api/finance/transactions/${id}`),
      summary: (query = "") => http.get<FinanceSummary>(`/api/finance/summary${query}`),
    },
    groups: {
      list: () => http.get<Group[]>("/api/groups"),
      get: (groupId: string) => http.get<Group>(`/api/groups/${groupId}`),
      create: (name: string) => http.post<Group>("/api/groups", { name }),
      update: (groupId: string, data: { name: string }) => http.patch<Group>(`/api/groups/${groupId}`, data),
      remove: (groupId: string) => http.delete<void>(`/api/groups/${groupId}`),
      members: (groupId: string) => http.get<GroupMember[]>(`/api/groups/${groupId}/members`),
      addMember: (groupId: string, userId: string, role?: string) =>
        http.post<GroupMember>(`/api/groups/${groupId}/members`, { userId, role }),
      updateMember: (groupId: string, userId: string, role: string) =>
        http.patch<GroupMember>(`/api/groups/${groupId}/members/${userId}`, { role }),
      removeMember: (groupId: string, userId: string) =>
        http.delete<void>(`/api/groups/${groupId}/members/${userId}`),
    },
    projects: {
      list: (groupId: string) => http.get<Project[]>(`/api/projects?groupId=${groupId}`),
      get: (id: string) => http.get<Project>(`/api/projects/${id}`),
      create: (data: Partial<Project> & { groupId: string }) => http.post<Project>("/api/projects", data),
      update: (id: string, data: Partial<Project>) => http.patch<Project>(`/api/projects/${id}`, data),
      remove: (id: string) => http.delete<void>(`/api/projects/${id}`),
    },
    deliverables: {
      list: (projectId: string) => http.get<Deliverable[]>(`/api/projects/${projectId}/deliverables`),
      create: (projectId: string, data: Partial<Deliverable>) =>
        http.post<Deliverable>(`/api/projects/${projectId}/deliverables`, data),
      update: (projectId: string, id: string, data: Partial<Deliverable>) =>
        http.patch<Deliverable>(`/api/projects/${projectId}/deliverables/${id}`, data),
      remove: (projectId: string, id: string) =>
        http.delete<void>(`/api/projects/${projectId}/deliverables/${id}`),
    },
    sessions: {
      list: (projectId: string) => http.get<WorkSession[]>(`/api/projects/${projectId}/sessions`),
      start: (projectId: string, note?: string) =>
        http.post<WorkSession>(`/api/projects/${projectId}/sessions`, { note }),
      create: (projectId: string, data: Partial<WorkSession>) =>
        http.post<WorkSession>(`/api/projects/${projectId}/sessions`, data),
      update: (projectId: string, id: string, data: Partial<WorkSession>) =>
        http.patch<WorkSession>(`/api/projects/${projectId}/sessions/${id}`, data),
      stop: (projectId: string, id: string) =>
        http.patch<WorkSession>(`/api/projects/${projectId}/sessions/${id}`, {
          endedAt: new Date().toISOString(),
        }),
      remove: (projectId: string, id: string) =>
        http.delete<void>(`/api/projects/${projectId}/sessions/${id}`),
    },
    comments: {
      list: (projectId: string) => http.get<ProjectComment[]>(`/api/projects/${projectId}/comments`),
      create: (projectId: string, body: string) =>
        http.post<ProjectComment>(`/api/projects/${projectId}/comments`, { body }),
      remove: (projectId: string, id: string) =>
        http.delete<void>(`/api/projects/${projectId}/comments/${id}`),
    },
    notifications: {
      list: (query = "") => http.get<Paginated<Notification>>(`/api/notifications${query}`),
      markRead: (id: string) => http.patch<Notification>(`/api/notifications/${id}/read`),
      markAllRead: () => http.patch<void>("/api/notifications/read-all"),
      remove: (id: string) => http.delete<void>(`/api/notifications/${id}`),
    },
    fitness: {
      logs: () => http.get<FitnessLog[]>("/api/fitness/logs"),
      createLog: (data: Partial<FitnessLog>) => http.post<FitnessLog>("/api/fitness/logs", data),
      updateLog: (id: string, data: Partial<FitnessLog>) =>
        http.patch<FitnessLog>(`/api/fitness/logs/${id}`, data),
      deleteLog: (id: string) => http.delete<void>(`/api/fitness/logs/${id}`),
      latestDietPlan: () => http.get<DietPlan | null>("/api/fitness/diet-plans/latest"),
      dietPlans: () => http.get<DietPlan[]>("/api/fitness/diet-plans"),
      createDietPlan: (data: Partial<DietPlan>) => http.post<DietPlan>("/api/fitness/diet-plans", data),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
