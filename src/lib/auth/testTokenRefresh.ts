import { apiClient, type RetriableRequestConfig } from "@lib/api/axios";
import { logTokenState } from "@lib/auth/tokenDebug";
import { refreshAuthTokens } from "@lib/auth/refreshTokens";
import {
  getSecureStorage,
  readSecureStorageDebug,
  setSecureStorage,
} from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import { isAxiosError } from "axios";

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
  return `${token.slice(0, 12)}…${token.slice(-8)}`;
};

export const testAccessTokenRefresh = async (): Promise<TokenRefreshTestResult> => {
  console.log("[TokenTest] ——— start ———");
  await logTokenState("1. initial");

  const refreshToken = await getSecureStorage(SECURE_STORAGE_KEYS.refreshToken);
  if (!refreshToken) {
    console.error("[TokenTest] No refresh token in storage");
    return {
      ok: false,
      message: "No refresh token found. Log in first.",
    };
  }

  const accessBefore = await getSecureStorage(SECURE_STORAGE_KEYS.accessToken);
  console.log("[TokenTest] access before corrupt:", tokenPreview(accessBefore));

  await setSecureStorage(SECURE_STORAGE_KEYS.accessToken, INVALID_ACCESS_TOKEN);
  await logTokenState("2. after setting invalid access token");

  const debugAfterCorrupt = await readSecureStorageDebug(
    SECURE_STORAGE_KEYS.accessToken,
  );
  if (debugAfterCorrupt.memory !== INVALID_ACCESS_TOKEN) {
    console.error("[TokenTest] Failed to write invalid token to memory", debugAfterCorrupt);
  }

  try {
    console.log("[TokenTest] GET /users/current-user (expect 401 → refresh → retry) …");
    const response = await apiClient.get("/users/current-user");
    const requestConfig = response.config as RetriableRequestConfig | undefined;

    console.log("[TokenTest] GET succeeded", {
      status: response.status,
      retried: Boolean(requestConfig?._retry),
      username: (response.data as { data?: { username?: string } })?.data?.username,
    });

    await logTokenState("3. after GET succeeded");

    const accessDebug = await readSecureStorageDebug(SECURE_STORAGE_KEYS.accessToken);
    const accessAfter = accessDebug.memory;

    console.log("[TokenTest] access after GET:", {
      memory: tokenPreview(accessDebug.memory),
      secureStore: tokenPreview(accessDebug.secureStore),
      stillInvalid: accessAfter === INVALID_ACCESS_TOKEN,
    });

    if (!accessAfter || accessAfter === INVALID_ACCESS_TOKEN) {
      console.warn(
        "[TokenTest] GET returned 200 but access token still invalid — refresh likely did not persist. Trying direct refresh …",
      );

      try {
        const tokens = await refreshAuthTokens();
        await logTokenState("4. after forced direct refresh");

        return {
          ok: true,
          message: `GET succeeded without saving refresh in interceptor; direct refresh fixed storage (${tokenPreview(tokens.accessToken)}). Check console [Auth] logs.`,
        };
      } catch (forceError) {
        console.error("[TokenTest] Forced direct refresh failed:", forceError);
        return {
          ok: false,
          message: `GET succeeded (status ${response.status}) but token stayed invalid. Interceptor may not have called refresh. Forced refresh failed: ${
            forceError instanceof Error ? forceError.message : "unknown"
          }. See console [TokenTest] / [Auth] logs.`,
        };
      }
    }

    return {
      ok: true,
      message: `Refresh OK (${tokenPreview(accessBefore)} → ${tokenPreview(accessAfter)}). Retried: ${requestConfig?._retry ? "yes" : "no"}.`,
    };
  } catch (interceptorError) {
    console.error("[TokenTest] GET failed:", interceptorError);
    await logTokenState("3. after GET failed");

    if (isAxiosError(interceptorError)) {
      console.error("[TokenTest] axios details", {
        status: interceptorError.response?.status,
        message: interceptorError.message,
        apiMessage: (interceptorError.response?.data as { message?: string })?.message,
      });
    }

    try {
      console.log("[TokenTest] Trying direct refreshAuthTokens() …");
      const tokens = await refreshAuthTokens();
      await logTokenState("4. after direct refresh");

      return {
        ok: true,
        message: `Interceptor path failed; direct refresh worked (${tokenPreview(tokens.accessToken)}). See console for details.`,
      };
    } catch (directError) {
      console.error("[TokenTest] Direct refresh failed:", directError);
      return {
        ok: false,
        message: `Refresh failed: ${
          directError instanceof Error ? directError.message : "Unknown error"
        }. Open the Metro/console log for [TokenTest] and [Auth] lines.`,
      };
    }
  }
};
