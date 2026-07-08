import * as SecureStore from "expo-secure-store";
import { createApiClient, type TokenStorage } from "shared";

const ACCESS_KEY = "crm.accessToken";
const REFRESH_KEY = "crm.refreshToken";

const secureStoreTokenStorage: TokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

// TODO: mover a variable de entorno (EXPO_PUBLIC_API_URL) para builds reales;
// 10.0.2.2 es el alias de "localhost" del host en el emulador de Android.
export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = createApiClient({ baseUrl: apiBaseUrl, tokenStorage: secureStoreTokenStorage });

export async function persistSession(accessToken: string, refreshToken: string) {
  await secureStoreTokenStorage.setTokens(accessToken, refreshToken);
}

export async function clearSession() {
  await secureStoreTokenStorage.clear();
}

export async function hasSession() {
  return Boolean(await secureStoreTokenStorage.getAccessToken());
}
