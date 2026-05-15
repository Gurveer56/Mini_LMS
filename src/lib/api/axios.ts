import { handleSessionExpired } from "@lib/auth/authBridge";
import {
  getSecureStorage,
  setSecureStorage,
} from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

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

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://api.freeapi.app/api/v1",
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getSecureStorage(SECURE_STORAGE_KEYS.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getSecureStorage(
          SECURE_STORAGE_KEYS.refreshToken,
        );

        if (!refreshToken) {
          processQueue(new Error("No refresh token available"), null);
          await handleSessionExpired();
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/users/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        await setSecureStorage(SECURE_STORAGE_KEYS.accessToken, newAccessToken);
        await setSecureStorage(SECURE_STORAGE_KEYS.refreshToken, newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
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
