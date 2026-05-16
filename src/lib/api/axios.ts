import { handleSessionExpired } from "@lib/auth/authBridge";
import { refreshAuthTokens } from "@lib/auth/refreshTokens";
import { logTokenState } from "@lib/auth/tokenDebug";
import { getSecureStorage } from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import {
  AxiosHeaders,
  create,
  type AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

export type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _retryWithoutAuth?: boolean;
  /** Set on retried requests so the request interceptor uses this token immediately. */
  __freshAccessToken?: string;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
};

export const API_TIMEOUT_MS = 15_000;

export const apiClient = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://api.freeapi.app/api/v1",
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const getRequestUrl = (config: InternalAxiosRequestConfig): string => {
  const url = config.url ?? "";
  if (url.startsWith("http")) {
    return url;
  }
  const base = config.baseURL ?? apiClient.defaults.baseURL ?? "";
  return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

export const isPublicApiRoute = (config: InternalAxiosRequestConfig): boolean => {
  return getRequestUrl(config).includes("/public/");
};

const isAuthRoute = (config: InternalAxiosRequestConfig): boolean => {
  const url = getRequestUrl(config);
  return (
    url.includes("/users/login") ||
    url.includes("/users/register") ||
    url.includes("/users/refresh-token")
  );
};

export const isAccessTokenError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return true;
  }

  const message =
    typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data &&
      typeof (error.response.data as { message: unknown }).message === "string"
      ? (error.response.data as { message: string }).message.toLowerCase()
      : "";

  return (
    message.includes("jwt") ||
    message.includes("unauthorized") ||
    message.includes("invalid token") ||
    message.includes("access token") ||
    message.includes("token expired") ||
    message.includes("malformed")
  );
};

const setAuthorizationHeader = (
  config: InternalAxiosRequestConfig,
  token: string | null,
) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }
};

const resolveOriginalRequest = (
  error: AxiosError,
): RetriableRequestConfig | undefined => {
  if (error.config) {
    return error.config as RetriableRequestConfig;
  }
  if (error.response?.config) {
    return error.response.config as RetriableRequestConfig;
  }
  return undefined;
};

const retryRequest = (
  originalRequest: RetriableRequestConfig,
  accessToken: string | null,
) => {
  const headers = AxiosHeaders.from(originalRequest.headers ?? {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  return apiClient.request({
    ...originalRequest,
    headers,
    __freshAccessToken: accessToken ?? undefined,
  } as RetriableRequestConfig);
};

apiClient.interceptors.request.use(
  async (config) => {
    const request = config as RetriableRequestConfig;

    if (request.__freshAccessToken) {
      setAuthorizationHeader(request, request.__freshAccessToken);
      delete request.__freshAccessToken;
      return request;
    }

    if (isAuthRoute(request)) {
      return request;
    }

    const accessToken = await getSecureStorage(SECURE_STORAGE_KEYS.accessToken);

    if (accessToken && !isPublicApiRoute(request)) {
      setAuthorizationHeader(request, accessToken);
    }

    if (request.data instanceof FormData) {
      request.headers.delete("Content-Type");
    }

    return request;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = resolveOriginalRequest(error);

    if (
      !originalRequest ||
      isAuthRoute(originalRequest) ||
      !isAccessTokenError(error)
    ) {
      if (__DEV__ && error.response?.status === 401) {
        console.log("[Auth] 401 not handled by refresh", {
          hasConfig: Boolean(originalRequest),
          isAuthRoute: originalRequest ? isAuthRoute(originalRequest) : false,
          isAccessTokenError: isAccessTokenError(error),
          url: originalRequest ? getRequestUrl(originalRequest) : "unknown",
        });
      }
      return Promise.reject(error);
    }

    const isPublic = isPublicApiRoute(originalRequest);

    if (__DEV__) {
      console.log("[Auth] 401 → attempting token refresh", {
        url: getRequestUrl(originalRequest),
        isPublic,
        status: error.response?.status,
        apiMessage: (error.response?.data as { message?: string })?.message,
      });
    }

    if (originalRequest._retryWithoutAuth) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      if (isPublic) {
        originalRequest._retryWithoutAuth = true;
        return retryRequest(originalRequest, null);
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => retryRequest(originalRequest, token))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const tokens = await refreshAuthTokens();
      processQueue(null, tokens.accessToken);

      if (__DEV__) {
        console.log("[Auth] Refresh OK, retrying request with new token …");
        await logTokenState("after refresh in interceptor");
      }

      return retryRequest(originalRequest, tokens.accessToken);
    } catch (refreshError) {
      if (__DEV__) {
        console.error("[Auth] Refresh failed in interceptor:", refreshError);
      }
      processQueue(refreshError, null);

      if (isPublic) {
        originalRequest._retryWithoutAuth = true;
        return retryRequest(originalRequest, null);
      }

      await handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }),
  post: <T>(url: string, data?: unknown, config?: object) =>
    apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: object) =>
    apiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: object) =>
    apiClient.patch<T>(url, data, config),
  delete: <T>(url: string) => apiClient.delete<T>(url),
};
