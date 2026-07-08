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

// Vacío = mismo origen (rutas relativas /api/*). El servidor Express sirve
// tanto la API como este frontend, y en dev Vite proxea /api a :4000.
export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

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
