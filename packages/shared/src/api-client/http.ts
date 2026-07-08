import type { ApiResponse } from "../types";

export interface TokenStorage {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  setTokens(accessToken: string, refreshToken: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  tokenStorage: TokenStorage;
}

export class HttpClient {
  private refreshPromise: Promise<string | null> | null = null;

  constructor(private config: ApiClientConfig) {}

  private async request<T>(
    path: string,
    options: RequestInit = {},
    retryOn401 = true,
  ): Promise<T> {
    const accessToken = await this.config.tokenStorage.getAccessToken();
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401 && retryOn401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.request<T>(path, options, false);
      }
      await this.config.tokenStorage.clear();
    }

    const body = (await res.json().catch(() => ({}))) as ApiResponse<T>;

    if (!res.ok || body.status === "error") {
      throw new ApiError(res.status, body.message ?? `Request failed with status ${res.status}`);
    }

    return body.data as T;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = await this.config.tokenStorage.getRefreshToken();
      if (!refreshToken) return null;

      try {
        const res = await fetch(`${this.config.baseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const body = (await res.json()) as ApiResponse<{ accessToken: string }>;
        const accessToken = body.data?.accessToken;
        if (!accessToken) return null;
        await this.config.tokenStorage.setTokens(accessToken, refreshToken);
        return accessToken;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}
