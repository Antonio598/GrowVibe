import { createApiClient, type TokenStorage } from "shared";

const ACCESS_KEY = "crm.accessToken";
const REFRESH_KEY = "crm.refreshToken";

const localStorageTokenStorage: TokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const api = createApiClient({ baseUrl: apiBaseUrl, tokenStorage: localStorageTokenStorage });

export function persistSession(accessToken: string, refreshToken: string) {
  localStorageTokenStorage.setTokens(accessToken, refreshToken);
}

export function clearSession() {
  localStorageTokenStorage.clear();
}

export function hasSession() {
  return Boolean(localStorage.getItem(ACCESS_KEY));
}
