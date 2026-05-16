import { logTokenState } from "@lib/auth/tokenDebug";
import {
  getSecureStorage,
  readSecureStorageDebug,
  setSecureStorage,
} from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import axios, { isAxiosError } from "axios";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.freeapi.app/api/v1"
).replace(/\/$/, "");

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

const parseRefreshResponse = (payload: unknown): RefreshedTokens | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const accessToken =
    typeof data.accessToken === "string" ? data.accessToken : null;
  const refreshToken =
    typeof data.refreshToken === "string" ? data.refreshToken : null;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
};

const persistTokens = async (tokens: RefreshedTokens): Promise<void> => {
  await setSecureStorage(SECURE_STORAGE_KEYS.accessToken, tokens.accessToken);
  await setSecureStorage(SECURE_STORAGE_KEYS.refreshToken, tokens.refreshToken);

  const verified = await readSecureStorageDebug(SECURE_STORAGE_KEYS.accessToken);

  if (verified.memory !== tokens.accessToken) {
    console.error("[Auth] Access token memory mismatch after save", {
      expected: tokens.accessToken.slice(0, 20),
      got: verified.memory?.slice(0, 20) ?? null,
    });
    throw new Error("Failed to persist access token in memory cache");
  }

  if (verified.secureStore !== tokens.accessToken) {
    console.warn(
      "[Auth] SecureStore access token differs from memory (using memory for requests)",
      {
        memoryPreview: tokens.accessToken.slice(0, 20),
        secureStorePreview: verified.secureStore?.slice(0, 20) ?? null,
      },
    );
  }
};

/**
 * POST /users/refresh-token — freeapi.app expects `{ refreshToken }` in the body.
 */
export const refreshAuthTokens = async (): Promise<RefreshedTokens> => {
  const refreshToken = await getSecureStorage(SECURE_STORAGE_KEYS.refreshToken);

  if (!refreshToken) {
    throw new Error("No refresh token in secure storage");
  }

  if (__DEV__) {
    console.log("[Auth] Calling POST /users/refresh-token …");
    await logTokenState("before refresh API");
  }

  try {
    const { data, status } = await axios.post(
      `${API_BASE_URL}/users/refresh-token`,
      { refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15_000,
      },
    );

    if (__DEV__) {
      console.log("[Auth] refresh-token response status:", status);
    }

    const tokens = parseRefreshResponse(data);

    if (!tokens) {
      console.error("[Auth] Unexpected refresh response shape:", data);
      throw new Error("Refresh response did not include accessToken/refreshToken");
    }

    await persistTokens(tokens);

    if (__DEV__) {
      await logTokenState("after refresh saved");
    }

    return tokens;
  } catch (error) {
    if (__DEV__) {
      console.error("[Auth] refresh-token failed:", error);
      await logTokenState("after refresh failed");
    }

    if (isAxiosError(error)) {
      const apiMessage =
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        "message" in error.response.data &&
        typeof (error.response.data as { message: unknown }).message === "string"
          ? (error.response.data as { message: string }).message
          : error.message;
      throw new Error(`Refresh token request failed: ${apiMessage}`);
    }
    throw error;
  }
};
