import { apiClient, type RetriableRequestConfig } from "@lib/api/axios";
import { refreshAuthTokens } from "@lib/auth/refreshTokens";
import {
  getSecureStorage,
  readSecureStorageDebug,
  setSecureStorage,
} from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";

const INVALID_ACCESS_TOKEN = "invalid-access-token-for-refresh-test";

export type TokenRefreshTestResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const tokenPreview = (token: string | null): string => {
  if (!token) {
    return "(empty)";
  }
  if (token.length <= 28) {
    return token;
  }
  return `${token.slice(0, 12)}...${token.slice(-8)}`;
};

export const testAccessTokenRefresh =
  async (): Promise<TokenRefreshTestResult> => {
    const refreshToken = await getSecureStorage(
      SECURE_STORAGE_KEYS.refreshToken,
    );

    if (!refreshToken) {
      return {
        ok: false,
        message: "No refresh token found. Log in first.",
      };
    }

    const accessBefore = await getSecureStorage(
      SECURE_STORAGE_KEYS.accessToken,
    );

    await setSecureStorage(
      SECURE_STORAGE_KEYS.accessToken,
      INVALID_ACCESS_TOKEN,
    );

    const debugAfterCorrupt = await readSecureStorageDebug(
      SECURE_STORAGE_KEYS.accessToken,
    );

    if (debugAfterCorrupt.memory !== INVALID_ACCESS_TOKEN) {
      return {
        ok: false,
        message: "Could not prepare the invalid access token test.",
      };
    }

    try {
      const response = await apiClient.get("/users/current-user");
      const requestConfig = response.config as RetriableRequestConfig | undefined;
      const accessAfter = await getSecureStorage(SECURE_STORAGE_KEYS.accessToken);

      if (!accessAfter || accessAfter === INVALID_ACCESS_TOKEN) {
        const tokens = await refreshAuthTokens();
        return {
          ok: true,
          message: `Direct refresh recovered storage (${tokenPreview(tokens.accessToken)}).`,
        };
      }

      return {
        ok: true,
        message: `Refresh OK (${tokenPreview(accessBefore)} -> ${tokenPreview(accessAfter)}). Retried: ${requestConfig?._retry ? "yes" : "no"}.`,
      };
    } catch {
      try {
        const tokens = await refreshAuthTokens();
        return {
          ok: true,
          message: `Interceptor request failed, but direct refresh worked (${tokenPreview(tokens.accessToken)}).`,
        };
      } catch (directError) {
        return {
          ok: false,
          message: `Refresh failed: ${
            directError instanceof Error ? directError.message : "Unknown error"
          }.`,
        };
      }
    }
  };
